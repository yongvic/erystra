import fs from "fs/promises";
import path from "path";
import zlib from "zlib";

function escapePdfText(value: string) {
  return value.replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function wrapLines(lines: string[], maxLength = 88) {
  const wrapped: string[] = [];

  for (const line of lines) {
    if (line.length <= maxLength) {
      wrapped.push(line);
      continue;
    }

    const words = line.split(/\s+/);
    let current = "";

    for (const word of words) {
      const next = current ? `${current} ${word}` : word;

      if (next.length > maxLength) {
        if (current) {
          wrapped.push(current);
        }
        current = word;
      } else {
        current = next;
      }
    }

    if (current) {
      wrapped.push(current);
    }
  }

  return wrapped;
}

function paethPredictor(a: number, b: number, c: number) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);

  if (pa <= pb && pa <= pc) {
    return a;
  }

  if (pb <= pc) {
    return b;
  }

  return c;
}

function readPngChunk(buffer: Buffer, offset: number) {
  const length = buffer.readUInt32BE(offset);
  const type = buffer.subarray(offset + 4, offset + 8).toString("ascii");
  const dataStart = offset + 8;
  const dataEnd = dataStart + length;

  return {
    length,
    type,
    data: buffer.subarray(dataStart, dataEnd),
    nextOffset: dataEnd + 4
  };
}

async function getPdfLogo() {
  const logoPath = path.join(process.cwd(), "public", "logo.png");
  const png = await fs.readFile(logoPath);
  const signature = png.subarray(0, 8).toString("hex");

  if (signature !== "89504e470d0a1a0a") {
    throw new Error("Unsupported logo format");
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  const idatParts: Buffer[] = [];

  while (offset < png.length) {
    const chunk = readPngChunk(png, offset);
    offset = chunk.nextOffset;

    if (chunk.type === "IHDR") {
      width = chunk.data.readUInt32BE(0);
      height = chunk.data.readUInt32BE(4);
      bitDepth = chunk.data.readUInt8(8);
      colorType = chunk.data.readUInt8(9);
    } else if (chunk.type === "IDAT") {
      idatParts.push(chunk.data);
    } else if (chunk.type === "IEND") {
      break;
    }
  }

  if (bitDepth !== 8 || ![2, 6].includes(colorType)) {
    throw new Error("Unsupported PNG bit depth or color type");
  }

  const bytesPerPixel = colorType === 6 ? 4 : 3;
  const stride = width * bytesPerPixel;
  const inflated = zlib.inflateSync(Buffer.concat(idatParts));
  const unfiltered = Buffer.alloc(height * stride);

  for (let row = 0; row < height; row += 1) {
    const rowStart = row * (stride + 1);
    const filterType = inflated[rowStart];
    const source = inflated.subarray(rowStart + 1, rowStart + 1 + stride);
    const targetRowStart = row * stride;

    for (let i = 0; i < stride; i += 1) {
      const left = i >= bytesPerPixel ? unfiltered[targetRowStart + i - bytesPerPixel] : 0;
      const up = row > 0 ? unfiltered[targetRowStart + i - stride] : 0;
      const upLeft = row > 0 && i >= bytesPerPixel ? unfiltered[targetRowStart + i - stride - bytesPerPixel] : 0;
      const current = source[i];

      switch (filterType) {
        case 0:
          unfiltered[targetRowStart + i] = current;
          break;
        case 1:
          unfiltered[targetRowStart + i] = (current + left) & 0xff;
          break;
        case 2:
          unfiltered[targetRowStart + i] = (current + up) & 0xff;
          break;
        case 3:
          unfiltered[targetRowStart + i] = (current + Math.floor((left + up) / 2)) & 0xff;
          break;
        case 4:
          unfiltered[targetRowStart + i] = (current + paethPredictor(left, up, upLeft)) & 0xff;
          break;
        default:
          throw new Error("Unsupported PNG filter");
      }
    }
  }

  const rgb = Buffer.alloc(width * height * 3);

  for (let pixel = 0, out = 0; pixel < unfiltered.length; pixel += bytesPerPixel, out += 3) {
    rgb[out] = unfiltered[pixel];
    rgb[out + 1] = unfiltered[pixel + 1];
    rgb[out + 2] = unfiltered[pixel + 2];
  }

  return {
    width,
    height,
    data: zlib.deflateSync(rgb)
  };
}

function buildPdfObject(id: number, body: string | Buffer) {
  const payload = Buffer.isBuffer(body) ? body : Buffer.from(body, "binary");
  return Buffer.concat([Buffer.from(`${id} 0 obj\n`, "ascii"), payload, Buffer.from("\nendobj\n", "ascii")]);
}

export async function createSimplePdf(fileName: string, lines: string[]) {
  const normalizedLines = wrapLines(lines).slice(0, 34);
  let textY = 700;

  const textCommands = normalizedLines
    .map((line) => {
      const command = `BT /F1 11 Tf 45 ${textY} Td (${escapePdfText(line)}) Tj ET`;
      textY -= 18;
      return command;
    })
    .join("\n");

  let logo;

  try {
    logo = await getPdfLogo();
  } catch {
    logo = null;
  }

  const contentParts: string[] = [
    "0.10 0.25 0.43 rg",
    "45 804 505 2 re f"
  ];

  if (logo) {
    const logoWidth = 170;
    const logoHeight = Math.round((logo.height / logo.width) * logoWidth);
    contentParts.push(`q ${logoWidth} 0 0 ${logoHeight} 45 730 cm /Im1 Do Q`);
  }

  contentParts.push(textCommands);
  const content = Buffer.from(contentParts.join("\n"), "ascii");

  const objects: Buffer[] = [];
  const pageResources = logo
    ? "<< /Font << /F1 4 0 R >> /XObject << /Im1 5 0 R >> >>"
    : "<< /Font << /F1 4 0 R >> >>";
  const contentObjectId = logo ? 6 : 5;

  objects.push(buildPdfObject(1, "<< /Type /Catalog /Pages 2 0 R >>"));
  objects.push(buildPdfObject(2, "<< /Type /Pages /Kids [3 0 R] /Count 1 >>"));
  objects.push(
    buildPdfObject(
      3,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources ${pageResources} /Contents ${contentObjectId} 0 R >>`
    )
  );
  objects.push(buildPdfObject(4, "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"));

  if (logo) {
    objects.push(
      buildPdfObject(
        5,
        Buffer.concat([
          Buffer.from(
            `<< /Type /XObject /Subtype /Image /Width ${logo.width} /Height ${logo.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode /Length ${logo.data.length} >>\nstream\n`,
            "ascii"
          ),
          logo.data,
          Buffer.from("\nendstream", "ascii")
        ])
      )
    );
  }

  objects.push(
    buildPdfObject(
      contentObjectId,
      Buffer.concat([
        Buffer.from(`<< /Length ${content.length} >>\nstream\n`, "ascii"),
        content,
        Buffer.from("\nendstream", "ascii")
      ])
    )
  );

  const header = Buffer.from("%PDF-1.4\n", "ascii");
  const parts: Buffer[] = [header];
  const offsets: number[] = [];
  let currentOffset = header.length;

  for (const object of objects) {
    offsets.push(currentOffset);
    parts.push(object);
    currentOffset += object.length;
  }

  const xrefOffset = currentOffset;
  const xrefLines = ["xref", `0 ${objects.length + 1}`, "0000000000 65535 f "];

  for (const offsetValue of offsets) {
    xrefLines.push(`${String(offsetValue).padStart(10, "0")} 00000 n `);
  }

  parts.push(
    Buffer.from(
      `${xrefLines.join("\n")}\ntrailer << /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`,
      "ascii"
    )
  );

  const pdf = Buffer.concat(parts);
  const targetPath = path.join(process.cwd(), "storage", "reports", fileName);
  await fs.mkdir(path.dirname(targetPath), { recursive: true });
  await fs.writeFile(targetPath, pdf);

  return targetPath;
}
