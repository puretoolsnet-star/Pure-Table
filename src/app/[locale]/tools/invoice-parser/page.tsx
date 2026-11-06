import { InvoiceParserTool } from "@/components/tools/InvoiceParserTool";
import { createToolPage } from "@/lib/seo/create-tool-page";

const page = createToolPage("invoice-parser", InvoiceParserTool);

export { instant } from "@/lib/seo/create-tool-page";
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.default;
