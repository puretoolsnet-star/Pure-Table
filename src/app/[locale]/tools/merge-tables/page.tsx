import { MergeTablesTool } from "@/components/tools/MergeTablesTool";
import { createToolPage } from "@/lib/seo/create-tool-page";

const page = createToolPage("merge-tables", MergeTablesTool);

export { instant } from "@/lib/seo/create-tool-page";
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.default;
