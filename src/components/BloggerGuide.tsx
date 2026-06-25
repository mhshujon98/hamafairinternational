import { useState } from 'react';
import { Copy, Check, FileCode, HelpCircle, AlertCircle, ExternalLink } from 'lucide-react';

export default function BloggerGuide() {
  const [copied, setCopied] = useState<string | null>(null);
  
  // Get current origin dynamically so it's always correct
  const appUrl = window.location.origin;

  const iframeCode = `<div style="width: 100%; max-width: 1200px; margin: 0 auto; overflow: hidden; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); background: #ffffff;">
  <iframe 
    src="${appUrl}" 
    style="width: 100%; height: 800px; border: none; display: block;" 
    allow="geolocation; camera; microphone"
    title="Hama Fair International Passenger Database">
  </iframe>
</div>`;

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div id="blogger-guide-container" className="bg-white rounded-2xl border border-gray-100 p-6 shadow-xs max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
        <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
          <FileCode className="h-6 w-6" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-900 font-sans">ব্লগার ওয়েবসাইট ইন্টিগ্রেশন গাইড (Blogger Integration Guide)</h2>
          <p className="text-xs text-gray-500 font-mono">hamafairinternational.blogspot.com</p>
        </div>
      </div>

      <div className="bg-amber-50/50 border border-amber-100 rounded-xl p-4 mb-6 flex gap-3 text-amber-800">
        <AlertCircle className="h-5 w-5 shrink-0 mt-0.5 text-amber-600" />
        <div className="text-sm">
          <p className="font-semibold mb-1">গুরুত্বপূর্ণ নোটিশ (Important Notice):</p>
          <p className="text-gray-700 leading-relaxed">
            আপনার ব্লগার সাইটের ভিজিটর ও এজেন্টদের জন্য এই যাত্রী ডাটাবেজ সিস্টেমটি সরাসরি ব্লগারে যুক্ত করতে নিচে দেওয়া কোডটি ব্যবহার করুন। যেহেতু ডাটাবেজটি ক্লাউড রান (Cloud Run) সার্ভারে হোস্ট করা আছে, আপনার ব্লগারে এটি যুক্ত করার পরেও সমস্ত তথ্য স্বয়ংক্রিয়ভাবে ক্লাউডে এবং লোকাল স্টোরেজে সুরক্ষিত থাকবে।
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Step 1 */}
        <div className="border border-gray-100 rounded-xl p-5 bg-gray-50/30">
          <h3 className="font-semibold text-gray-900 text-sm mb-3 flex items-center gap-2">
            <span className="flex items-center justify-center h-6 w-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold">১</span>
            ব্লগারে আইফ্রেম (Iframe) কোড যুক্ত করার নিয়ম:
          </h3>
          <p className="text-sm text-gray-600 mb-4 ml-8 leading-relaxed">
            ব্লগার থিমের <strong>Edit HTML</strong>-এ অথবা একটি নতুন <strong>Page (পাতা)</strong> খুলে HTML ভিউতে নিচের কোডটি পেস্ট করুন। পেজ হিসেবে যুক্ত করলে এটি ফুল-স্ক্রিন সুন্দর দেখাবে।
          </p>

          <div className="relative ml-8">
            <pre className="bg-gray-900 text-gray-100 rounded-xl p-4 text-xs font-mono overflow-x-auto whitespace-pre leading-relaxed shadow-inner">
              {iframeCode}
            </pre>
            <button
              id="copy-iframe-code-btn"
              onClick={() => copyToClipboard(iframeCode, 'iframe')}
              className="absolute top-3 right-3 p-2 bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white rounded-lg transition-colors border border-gray-700 flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            >
              {copied === 'iframe' ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-400" />
                  <span className="text-emerald-400">কপি হয়েছে!</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span>কোড কপি করুন</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Instructions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-100 rounded-xl p-4 bg-white shadow-xs">
            <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-indigo-500" />
              অপশন ক: পেজ (Pages) আকারে যুক্ত করা (সেরা উপায়)
            </h4>
            <ol className="text-xs text-gray-600 space-y-2 list-decimal pl-4 leading-relaxed">
              <li>আপনার <strong>Blogger Dashboard</strong>-এ লগইন করুন।</li>
              <li>বাম পাশের মেনু থেকে <strong>Pages</strong>-এ যান এবং <strong>New Page</strong> তৈরি করুন।</li>
              <li>টাইটেল দিন (যেমন: <code>যাত্রী ডাটাবেজ - Passenger Database</code>)।</li>
              <li>এডিটর মোড পরিবর্তন করে <strong>HTML View</strong> সিলেক্ট করুন।</li>
              <li>ওপরের কপি করা কোডটি পেস্ট করুন এবং <strong>Publish</strong> করুন।</li>
            </ol>
          </div>

          <div className="border border-gray-100 rounded-xl p-4 bg-white shadow-xs">
            <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center gap-1.5">
              <HelpCircle className="h-4 w-4 text-teal-500" />
              অপশন খ: সরাসরি থিম (Edit HTML) এ যুক্ত করা
            </h4>
            <ol className="text-xs text-gray-600 space-y-2 list-decimal pl-4 leading-relaxed">
              <li>আপনার <strong>Blogger Dashboard</strong>-এ যান ও <strong>Theme</strong> সিলেক্ট করুন।</li>
              <li>Customize ড্রপডাউন থেকে <strong>Edit HTML</strong> এ ক্লিক করুন।</li>
              <li>আপনার সাইটের যেখানে ডাটাবেজ দেখাতে চান (যেমন <code>&lt;div class='main-wrapper'&gt;</code> এর নিচে) সেখানে ওপরের কোডটি পেস্ট করুন।</li>
              <li><strong>Save</strong> বাটনে ক্লিক করে থিম সংরক্ষণ করুন।</li>
            </ol>
          </div>
        </div>

        {/* Live status check */}
        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-gray-100 pt-5 gap-3">
          <div className="text-xs text-gray-500 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>ডাটাবেজ সার্ভার রানিং: <a href={appUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline font-mono inline-flex items-center gap-0.5">{appUrl} <ExternalLink className="h-3 w-3 inline" /></a></span>
          </div>
          <span className="text-xs text-indigo-600 font-semibold bg-indigo-50 px-3 py-1.5 rounded-full">Hama Fair International Travel Agency</span>
        </div>
      </div>
    </div>
  );
}
