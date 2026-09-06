import type {Metadata} from "next";
import Script from "next/script";
import "./globals.css";
export const metadata:Metadata={metadataBase:new URL("https://naturable.app"),title:{default:"Naturable — Natural writing editor",template:"%s — Naturable"},description:"A private bilingual natural writing editor for English and Simplified Chinese.",alternates:{languages:{en:"/en/","zh-CN":"/zh-cn/","x-default":"/en/"}},other:{google:"notranslate"}};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="en"><body><Script src="https://ccc-monitor.583079497.workers.dev/beacon.js" data-site="naturable.app" strategy="afterInteractive"/>{children}</body></html>}
