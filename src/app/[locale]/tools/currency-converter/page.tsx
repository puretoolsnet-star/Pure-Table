import { CurrencyConverterTool } from "@/components/tools/CurrencyConverterTool";
import { createToolPage } from "@/lib/seo/create-tool-page";

const page = createToolPage("currency-converter", CurrencyConverterTool);

export { instant } from "@/lib/seo/create-tool-page";
export const generateStaticParams = page.generateStaticParams;
export const generateMetadata = page.generateMetadata;
export default page.default;
