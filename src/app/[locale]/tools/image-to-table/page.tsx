import { ImageToTableTool } from "@/components/tools/ImageToTableTool";
import { createToolPage } from "@/lib/seo/create-tool-page";

const page = createToolPage("image-to-table", ImageToTableTool);

export { instant } from "@/lib/seo/create-tool-page";
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.default;
