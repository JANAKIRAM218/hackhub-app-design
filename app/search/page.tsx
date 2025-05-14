"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { MainNav } from "@/components/main-nav"
import { Sidebar } from "@/components/sidebar"
import { PostCard } from "@/components/post-card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Search, User, Hash, FileText } from "lucide-react"
import { usePosts, type Post } from "@/hooks/use-posts"

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get("q") || ""
  const [activeTab, setActiveTab] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const { posts } = usePosts()

  // Search results
  const [results, setResults] = useState<{
    posts: Post[]
    users: any[]
    topics: any[]
  }>({
    posts: [],
    users: [],
    topics: [],
  })

  // Mock users for search
  const mockUsers = [
    {
      id: "user-1",
      name: "Sarah Connor",
      username: "techrebel",
      avatar: "/placeholder.svg?height=100&width=100",
      bio: "Cybersecurity specialist | Ethical hacker | AI researcher | Building the resistance against Skynet",
    },
    {
      id: "user-2",
      name: "Alex Chen",
      username: "alexc0der",
      avatar: "/placeholder.svg?height=40&width=40",
      bio: "Security researcher | Bug bounty hunter | Coffee addict",
    },
    {
      id: "user-3",
      name: "Sophia Kim",
      username: "sophiadev",
      avatar: "/placeholder.svg?height=40&width=40",
      bio: "Full-stack developer | Open source contributor | AI enthusiast",
    },
    {
      id: "user-4",
      name: "Marcus Johnson",
      username: "mjhacker",
      avatar: "/placeholder.svg?height=40&width=40",
      bio: "Cybersecurity specialist | Ethical hacker | Speaker",
    },
    {
      id: "user-5",
      name: "Tech Innovator",
      username: "techinnovator",
      avatar: "/placeholder.svg?height=40&width=40",
      bio: "AI researcher | PhD in Computer Science | Blockchain developer",
    },
  ]

  // Mock topics for search
  const mockTopics = [
    { id: "topic-1", name: "cybersecurity", posts: 1243 },
    { id: "topic-2", name: "AI", posts: 982 },
    { id: "topic-3", name: "blockchain", posts: 754 },
    { id: "topic-4", name: "quantumcomputing", posts: 521 },
    { id: "topic-5", name: "ethicalhacking", posts: 498 },
    { id: "topic-6", name: "machinelearning", posts: 432 },
    { id: "topic-7", name: "python", posts: 387 },
    { id: "topic-8", name: "javascript", posts: 356 },
  ]

  // Perform search when query changes
  useEffect(() => {
    if (!query) return

    setIsLoading(true)

    // Simulate API delay
    setTimeout(() => {
      const normalizedQuery = query.toLowerCase().trim()

      // Search posts
      const matchedPosts = posts.filter(
        (post) =>
          post.content.toLowerCase().includes(normalizedQuery) ||
          post.user.name.toLowerCase().includes(normalizedQuery) ||
          post.user.username.toLowerCase().includes(normalizedQuery),
      )

      // Search users
      const matchedUsers = mockUsers.filter(
        (user) =>
          user.name.toLowerCase().includes(normalizedQuery) ||
          user.username.toLowerCase().includes(normalizedQuery) ||
          user.bio.toLowerCase().includes(normalizedQuery),
      )

      // Search topics
      const matchedTopics = mockTopics.filter((topic) => topic.name.toLowerCase().includes(normalizedQuery))

      setResults({
        posts: matchedPosts,
        users: matchedUsers,
        topics: matchedTopics,
      })

      setIsLoading(false)
    }, 1000)
  }, [query, posts])

  return (
    <div className="min-h-screen">
      <MainNav />
      <div className="container grid grid-cols-1 md:grid-cols-12 gap-6 py-6">
        <aside className="hidden md:block md:col-span-3">
          <Sidebar className="sticky top-20" />
        </aside>

        <main className="md:col-span-9 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <Search className="h-6 w-6 text-neon-green" />
            <h1 className="text-2xl font-bold font-mono glow-text">Search Results for "{query}"</h1>
          </div>

          <Tabs defaultValue="all" className="w-full" onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-4 mb-6 bg-muted/30">
              <TabsTrigger value="all" className="data-[state=active]:bg-muted/50 data-[state=active]:text-neon-green">
                All
              </TabsTrigger>
              <TabsTrigger
                value="posts"
                className="data-[state=active]:bg-muted/50 data-[state=active]:text-neon-green"
              >
                <FileText className="mr-2 h-4 w-4" />
                Posts
              </TabsTrigger>
              <TabsTrigger
                value="users"
                className="data-[state=active]:bg-muted/50 data-[state=active]:text-neon-green"
              >
                <User className="mr-2 h-4 w-4" />
                Users
              </TabsTrigger>
              <TabsTrigger
                value="topics"
                className="data-[state=active]:bg-muted/50 data-[state=active]:text-neon-green"
              >
                <Hash className="mr-2 h-4 w-4" />
                Topics
              </TabsTrigger>
            </TabsList>

            {isLoading ? (
              <div className="flex justify-center py-12">
                <div className="h-8 w-8 rounded-full border-2 border-neon-green border-t-transparent animate-spin"></div>
              </div>
            ) : (
              <>
                {/* All Results Tab */}
                <TabsContent value="all" className="space-y-6 mt-0">
                  {results.users.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <User className="h-5 w-5 text-neon-green" />
                        Users
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {results.users.slice(0, 3).map((user) => (
                          <Card key={user.id} className="border-border/40 bg-background/80 backdrop-blur-sm">
                            <CardContent className="p-4 flex items-center gap-3">
                              <Avatar>
                                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1">
                                  <span className="font-semibold truncate">{user.name}</span>
                                  <span className="text-muted-foreground text-xs">@{user.username}</span>
                                </div>
                                <p className="text-xs text-muted-foreground line-clamp-1">{user.bio}</p>
                              </div>
                              <Button variant="outline" size="sm" className="glow-blue hover:text-neon-blue">
                                View
                              </Button>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      {results.users.length > 3 && (
                        <Button variant="outline" className="w-full" onClick={() => setActiveTab("users")}>
                          View all {results.users.length} users
                        </Button>
                      )}
                    </div>
                  )}

                  {results.topics.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <Hash className="h-5 w-5 text-neon-green" />
                        Topics
                      </h2>
                      <div className="flex flex-wrap gap-2">
                        {results.topics.map((topic) => (
                          <Button
                            key={topic.id}
                            variant="outline"
                            className="hover:border-neon-blue hover:text-neon-blue"
                          >
                            #{topic.name}
                            <span className="ml-1 text-xs text-muted-foreground">{topic.posts}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {results.posts.length > 0 && (
                    <div className="space-y-4">
                      <h2 className="text-lg font-semibold flex items-center gap-2">
                        <FileText className="h-5 w-5 text-neon-green" />
                        Posts
                      </h2>
                      {results.posts.slice(0, 3).map((post) => (
                        <PostCard key={post.id} post={post} />
                      ))}
                      {results.posts.length > 3 && (
                        <Button variant="outline" className="w-full" onClick={() => setActiveTab("posts")}>
                          View all {results.posts.length} posts
                        </Button>
                      )}
                    </div>
                  )}

                  {results.users.length === 0 && results.topics.length === 0 && results.posts.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Search className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No results found</h3>
                      <p className="text-muted-foreground">We couldn't find anything matching "{query}"</p>
                    </div>
                  )}
                </TabsContent>

                {/* Posts Tab */}
                <TabsContent value="posts" className="space-y-4 mt-0">
                  {results.posts.length > 0 ? (
                    results.posts.map((post) => <PostCard key={post.id} post={post} />)
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No posts found</h3>
                      <p className="text-muted-foreground">We couldn't find any posts matching "{query}"</p>
                    </div>
                  )}
                </TabsContent>

                {/* Users Tab */}
                <TabsContent value="users" className="mt-0">
                  {results.users.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.users.map((user) => (
                        <Card key={user.id} className="border-border/40 bg-background/80 backdrop-blur-sm">
                          <CardContent className="p-4">
                            <div className="flex flex-col items-center text-center">
                              <Avatar className="h-20 w-20 mb-4 border-2 border-neon-green glow">
                                <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                                <AvatarFallback className="text-xl">{user.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="space-y-1 mb-4">
                                <h3 className="font-semibold">{user.name}</h3>
                                <p className="text-sm text-neon-green font-mono">@{user.username}</p>
                                <p className="text-xs text-muted-foreground">{user.bio}</p>
                              </div>
                              <Button variant="outline" className="w-full glow">
                                View Profile
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <User className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No users found</h3>
                      <p className="text-muted-foreground">We couldn't find any users matching "{query}"</p>
                    </div>
                  )}
                </TabsContent>

                {/* Topics Tab */}
                <TabsContent value="topics" className="mt-0">
                  {results.topics.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {results.topics.map((topic) => (
                        <Card key={topic.id} className="border-border/40 bg-background/80 backdrop-blur-sm">
                          <CardContent className="p-4">
                            <div className="flex flex-col items-center text-center">
                              <div className="h-20 w-20 rounded-full bg-muted/30 flex items-center justify-center mb-4 border-2 border-neon-blue glow-blue">
                                <Hash className="h-10 w-10 text-neon-blue" />
                              </div>
                              <div className="space-y-1 mb-4">
                                <h3 className="font-semibold text-lg">#{topic.name}</h3>
                                <p className="text-sm text-muted-foreground">{topic.posts} posts</p>
                              </div>
                              <Button variant="outline" className="w-full glow-blue">
                                View Topic
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Hash className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No topics found</h3>
                      <p className="text-muted-foreground">We couldn't find any topics matching "{query}"</p>
                    </div>
                  )}
                </TabsContent>
              </>
            )}
          </Tabs>
        </main>
      </div>
    </div>
  )
}
