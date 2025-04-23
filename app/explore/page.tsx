import { MainNav } from "@/components/main-nav"
import { Sidebar } from "@/components/sidebar"
import { PostCard } from "@/components/post-card"
import { TrendingTopics } from "@/components/trending-topics"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Zap, Clock, Award } from "lucide-react"

export default function ExplorePage() {
  // Mock data for posts
  const trendingPosts = [
    {
      id: "1",
      user: {
        name: "Tech Innovator",
        username: "techinnovator",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content:
        "Just released our new quantum encryption library. 100x faster than traditional methods with unbreakable security! #quantumcomputing #cybersecurity",
      image: "/placeholder.svg?height=300&width=600",
      likes: 532,
      comments: 89,
      shares: 124,
      createdAt: "3h ago",
    },
    {
      id: "2",
      user: {
        name: "AI Research Lab",
        username: "airesearchlab",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content:
        "We've trained an AI model that can generate secure code and identify vulnerabilities automatically. Open-sourcing next week! #AI #securecodegen",
      code: {
        language: "javascript",
        content:
          "// Example of AI-generated secure code\nfunction sanitizeInput(input) {\n  if (typeof input !== 'string') {\n    throw new TypeError('Input must be a string');\n  }\n  \n  // Remove potentially dangerous characters\n  return input\n    .replace(/[\\u0000-\\u001F\\u007F-\\u009F]/g, '')\n    .replace(/[&<>\"']/g, (char) => {\n      switch (char) {\n        case '&': return '&amp;';\n        case '<': return '&lt;';\n        case '>': return '&gt;';\n        case '\"': return '&quot;';\n        case \"'\": return '&#39;';\n        default: return char;\n      }\n    });\n}",
      },
      likes: 876,
      comments: 145,
      shares: 231,
      createdAt: "6h ago",
    },
    {
      id: "3",
      user: {
        name: "Blockchain Dev",
        username: "blockchaindev",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content:
        "Just discovered a critical vulnerability in a popular smart contract framework. Responsible disclosure in progress. Stay tuned for details after it's patched. #blockchain #security",
      likes: 421,
      comments: 67,
      shares: 98,
      createdAt: "1d ago",
    },
  ]

  const latestPosts = [
    {
      id: "4",
      user: {
        name: "Julia Chen",
        username: "juliadevops",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content:
        "Just automated our entire CI/CD pipeline with this custom script. Deployment time reduced by 70%! #devops #automation",
      code: {
        language: "bash",
        content:
          '#!/bin/bash\n\n# Automated deployment script\necho "Starting deployment process..."\n\n# Run tests\necho "Running tests..."\nnpm test\n\nif [ $? -eq 0 ]; then\n  echo "Tests passed! Building application..."\n  npm run build\n  \n  if [ $? -eq 0 ]; then\n    echo "Build successful! Deploying to production..."\n    # Deploy to production\n    rsync -avz --delete dist/ user@production-server:/var/www/app/\n    echo "Deployment complete!"\n  else\n    echo "Build failed. Aborting deployment."\n    exit 1\n  fi\nelse\n  echo "Tests failed. Aborting deployment."\n  exit 1\nfi',
      },
      likes: 32,
      comments: 5,
      shares: 2,
      createdAt: "15m ago",
    },
    {
      id: "5",
      user: {
        name: "Cyber Guardian",
        username: "cyberguardian",
        avatar: "/placeholder.svg?height=40&width=40",
      },
      content:
        "Just published my comprehensive guide on setting up a secure home lab for penetration testing. Link in comments! #cybersecurity #pentesting",
      image: "/placeholder.svg?height=300&width=600",
      likes: 18,
      comments: 3,
      shares: 1,
      createdAt: "32m ago",
    },
  ]

  // Mock data for trending topics
  const trendingTopics = [
    { id: "1", name: "cybersecurity", posts: 1243 },
    { id: "2", name: "AI", posts: 982 },
    { id: "3", name: "blockchain", posts: 754 },
    { id: "4", name: "quantumcomputing", posts: 521 },
    { id: "5", name: "ethicalhacking", posts: 498 },
    { id: "6", name: "machinelearning", posts: 432 },
    { id: "7", name: "python", posts: 387 },
    { id: "8", name: "javascript", posts: 356 },
  ]

  return (
    <div className="min-h-screen">
      <MainNav />
      <div className="container grid grid-cols-1 md:grid-cols-12 gap-6 py-6">
        <aside className="hidden md:block md:col-span-3">
          <Sidebar className="sticky top-20" />
        </aside>

        <main className="md:col-span-6 space-y-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold font-mono glow-text mb-4">Explore</h1>

            <Tabs defaultValue="trending" className="w-full">
              <TabsList className="grid grid-cols-3 mb-4 bg-muted/30">
                <TabsTrigger
                  value="trending"
                  className="data-[state=active]:bg-muted/50 data-[state=active]:text-neon-green"
                >
                  <Zap className="mr-2 h-4 w-4" />
                  Trending
                </TabsTrigger>
                <TabsTrigger
                  value="latest"
                  className="data-[state=active]:bg-muted/50 data-[state=active]:text-neon-green"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Latest
                </TabsTrigger>
                <TabsTrigger
                  value="top"
                  className="data-[state=active]:bg-muted/50 data-[state=active]:text-neon-green"
                >
                  <Award className="mr-2 h-4 w-4" />
                  Top
                </TabsTrigger>
              </TabsList>

              <TabsContent value="trending" className="space-y-4 mt-0">
                {trendingPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </TabsContent>

              <TabsContent value="latest" className="space-y-4 mt-0">
                {latestPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </TabsContent>

              <TabsContent value="top" className="space-y-4 mt-0">
                <div className="flex items-center justify-center h-40 border border-dashed rounded-md border-border/40">
                  <p className="text-muted-foreground">Top posts of all time will appear here</p>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>

        <aside className="hidden md:block md:col-span-3 space-y-6">
          <div className="sticky top-20 space-y-6">
            <TrendingTopics topics={trendingTopics} />
          </div>
        </aside>
      </div>
    </div>
  )
}
