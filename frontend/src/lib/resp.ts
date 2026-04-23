export function encodeCommand(command: string): string {
  // Simple argument splitting by spaces.
  const args = command.trim().split(/\s+/);

  if (args.length === 0 || args[0] === '') {
    return '';
  }

  // Create the RESP array header
  let resp = `*${args.length}\r\n`;

  // Append each argument as a bulk string
  for (const arg of args) {
    // Buffer.byteLength supports proper length calculation for UTF-8 inputs
    const byteLength = Buffer.byteLength(arg, 'utf-8');
    resp += `$${byteLength}\r\n${arg}\r\n`;
  }

  return resp;
}
