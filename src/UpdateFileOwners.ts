import { FlushContent as FlushContent } from "./FlushContent";
import { Permissions } from "./Permissions";
import { PDFSender } from "./PDFSender";
import { Variables } from "./common/Variables";

export { UpdateFileOwners };

namespace UpdateFileOwners {
  const flushContent = FlushContent;
  const Perms = Permissions;
  const pdfSender = PDFSender;
  const Vars = Variables;

  export function updateOwners(): void {
      
  }
}
