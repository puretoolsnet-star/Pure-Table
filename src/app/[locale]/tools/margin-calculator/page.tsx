import { MarginCalculatorTool } from "@/components/tools/MarginCalculatorTool";
import { createToolPage } from "@/lib/seo/create-tool-page";

const page = createToolPage("margin-calculator", MarginCalculatorTool);

export { instant } from "@/lib/seo/create-tool-page";
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.default;
