import { TextToExcelTool } from "@/components/tools/TextToExcelTool";
import { createToolPage } from "@/lib/seo/create-tool-page";

const page = createToolPage("text-to-excel", TextToExcelTool);

export { instant } from "@/lib/seo/create-tool-page";
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.default;
