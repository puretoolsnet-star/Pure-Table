import { QrGeneratorTool } from "@/components/tools/QrGeneratorTool";
import { createToolPage } from "@/lib/seo/create-tool-page";

const page = createToolPage("qr-generator", QrGeneratorTool);

export { instant } from "@/lib/seo/create-tool-page";
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.default;
