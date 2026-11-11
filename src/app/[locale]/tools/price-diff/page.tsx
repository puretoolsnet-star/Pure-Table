import { PriceDiffTool } from "@/components/tools/PriceDiffTool";
import { createToolPage } from "@/lib/seo/create-tool-page";

const page = createToolPage("price-diff", PriceDiffTool);

export { instant } from "@/lib/seo/create-tool-page";
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.default;
