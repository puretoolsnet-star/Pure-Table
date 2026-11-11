import { DataCleanerTool } from "@/components/tools/DataCleanerTool";
import { createToolPage } from "@/lib/seo/create-tool-page";

const page = createToolPage("data-cleaner", DataCleanerTool);

export { instant } from "@/lib/seo/create-tool-page";
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.default;
