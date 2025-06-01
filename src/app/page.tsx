"use client"

import { useState } from "react"
import ReactMarkdown from "react-markdown"
import { Github, Download, Copy, Eye, Code, Sparkles, FileText, CheckCircle } from "lucide-react"

export default function Home() {
  const [repoUrl, setRepoUrl] = useState("")
  const [loading, setLoading] = useState(false)
  const [readme, setReadme] = useState("")
  const [error, setError] = useState("")
  const [viewMode, setViewMode] = useState<"preview" | "markdown">("preview")
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setReadme("")

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repoUrl }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Failed to analyze repository")
      setReadme(data.readme)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    const blob = new Blob([readme], { type: "text/markdown" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "README.md"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    await navigator.clipboard.writeText(readme)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1.5'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }}></div>
      </div>
      
      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-8 min-h-screen">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-4 shadow-lg">
            <Github className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            README Generator
          </h1>
          <p className="text-slate-400 text-lg">Transform your repositories into professional documentation</p>
        </div>

        {/* Main Card */}
        <main className="w-full max-w-4xl mx-auto">
          <div className="bg-white bg-opacity-10 backdrop-blur-xl border border-white border-opacity-20 rounded-2xl shadow-2xl p-6 md:p-8">
            {/* Input Section */}
            <div className="mb-8">
              <label htmlFor="repoUrl" className="block text-sm font-medium text-white mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                GitHub Repository URL
              </label>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <input
                    id="repoUrl"
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    placeholder="https://github.com/username/repository"
                    className="w-full px-4 py-3 bg-white bg-opacity-5 border border-white border-opacity-20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    required
                  />
                </div>
                <button 
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center min-w-[140px]"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 mr-2" />
                      Generate
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 rounded-xl border border-red-400 border-opacity-20 bg-red-500 bg-opacity-10 text-red-300 text-sm backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  {error}
                </div>
              </div>
            )}

            {/* Results Section */}
            {readme && (
              <div className="space-y-4">
                {/* Action Buttons */}
                <div className="flex flex-wrap gap-2 p-4 bg-white bg-opacity-5 rounded-xl border border-white border-opacity-10">
                  <button
                    type="button"
                    onClick={() => setViewMode(viewMode === "preview" ? "markdown" : "preview")}
                    className="flex items-center gap-2 px-4 py-2 bg-white bg-opacity-10 hover:bg-opacity-20 text-white rounded-lg transition-all duration-200 border border-white border-opacity-20"
                  >
                    {viewMode === "preview" ? (
                      <>
                        <Code className="w-4 h-4" />
                        View Markdown
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4" />
                        View Preview
                      </>
                    )}
                  </button>
                  <button 
                    type="button" 
                    onClick={handleDownload}
                    className="flex items-center gap-2 px-4 py-2 bg-green-500 bg-opacity-20 hover:bg-opacity-30 text-green-300 rounded-lg transition-all duration-200 border border-green-500 border-opacity-30"
                  >
                    <Download className="w-4 h-4" />
                    Download
                  </button>
                  <button 
                    type="button" 
                    onClick={handleCopy}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 border ${
                      copied 
                        ? 'bg-green-500 bg-opacity-20 text-green-300 border-green-500 border-opacity-30' 
                        : 'bg-blue-500 bg-opacity-20 hover:bg-opacity-30 text-blue-300 border-blue-500 border-opacity-30'
                    }`}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </button>
                </div>

                {/* Content Display */}
                <div className="rounded-xl border border-white border-opacity-20 bg-slate-900 bg-opacity-50 backdrop-blur-sm overflow-hidden">
                  <div className="p-6 max-h-[600px] overflow-y-auto">
                    {viewMode === "preview" ? (
                      <div className="prose prose-invert prose-blue max-w-none">
                        <ReactMarkdown
                          components={{
                            h1: ({children}) => <h1 className="text-3xl font-bold text-white mb-4 border-b border-slate-700 pb-2">{children}</h1>,
                            h2: ({children}) => <h2 className="text-2xl font-semibold text-slate-200 mb-3 mt-6">{children}</h2>,
                            h3: ({children}) => <h3 className="text-xl font-medium text-slate-300 mb-2 mt-4">{children}</h3>,
                            p: ({children}) => <p className="text-slate-300 mb-3 leading-relaxed">{children}</p>,
                            code: ({children}) => <code className="bg-slate-800 text-blue-300 px-2 py-1 rounded text-sm">{children}</code>,
                            pre: ({children}) => <pre className="bg-slate-800 p-4 rounded-lg overflow-x-auto mb-4 border border-slate-700">{children}</pre>,
                            ul: ({children}) => <ul className="text-slate-300 mb-4 pl-6 space-y-1">{children}</ul>,
                            ol: ({children}) => <ol className="text-slate-300 mb-4 pl-6 space-y-1">{children}</ol>,
                            li: ({children}) => <li className="text-slate-300">{children}</li>,
                            blockquote: ({children}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-slate-400 mb-4">{children}</blockquote>,
                          }}
                        >
                          {readme}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <pre className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap break-words font-mono">
                        {readme}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>

        {/* Footer */}
        <footer className="mt-12 text-slate-500 text-sm text-center">
          <p>
            &copy; {new Date().getFullYear()} README Generator. 
            <a 
              href="https://github.com/your-github-username/readme-generator" 
              className="text-blue-400 hover:text-blue-300 underline ml-1 transition-colors duration-200"
              target="_blank"
              rel="noopener noreferrer"
            >
              View on GitHub
            </a>
          </p>
        </footer>
      </div>
    </div>
  )
}