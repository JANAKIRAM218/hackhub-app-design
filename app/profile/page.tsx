import { MainNav } from "@/components/main-nav"
import { Sidebar } from "@/components/sidebar"
import { PostCard } from "@/components/post-card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { FileCode, ImageIcon, MessageSquare, Bookmark, LinkIcon, MapPin, Calendar } from "lucide-react"

export default function ProfilePage() {
  // Mock user data
  const user = {
    name: "Sarah Connor",
    username: "techrebel",
    avatar: "/placeholder.svg?height=100&width=100",
    bio: "Cybersecurity specialist | Ethical hacker | AI researcher | Building the resistance against Skynet",
    location: "Los Angeles, CA",
    website: "https://sarahconnor.tech",
    joinedDate: "Joined March 2023",
    following: 245,
    followers: 1024,
    posts: [
      {
        id: "1",
        user: {
          name: "Sarah Connor",
          username: "techrebel",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        content:
          "Just discovered a backdoor in a popular IoT device. Manufacturers need to take security seriously! #IoTSecurity #hacking",
        image: "/placeholder.svg?height=300&width=600",
        likes: 87,
        comments: 14,
        shares: 23,
        createdAt: "2d ago",
      },
      {
        id: "2",
        user: {
          name: "Sarah Connor",
          username: "techrebel",
          avatar: "/placeholder.svg?height=40&width=40",
        },
        content:
          "My latest research on neural network vulnerabilities is now published. Here's a code snippet showing how to exploit a common flaw:",
        code: {
          language: "python",
          content:
            'import numpy as np\nimport tensorflow as tf\n\ndef create_adversarial_example(model, image, true_label, epsilon=0.01):\n    """Generate an adversarial example"""\n    image_tensor = tf.convert_to_tensor(image[np.newaxis, ...], dtype=tf.float32)\n    \n    with tf.GradientTape() as tape:\n        tape.watch(image_tensor)\n        prediction = model(image_tensor)\n        loss = tf.keras.losses.sparse_categorical_crossentropy(\n            [true_label], prediction\n        )\n    \n    # Get the gradients\n    gradient = tape.gradient(loss, image_tensor)\n    \n    # Create the adversarial example\n    signed_grad = tf.sign(gradient)\n    adversarial = image + epsilon * signed_grad[0]\n    \n    # Clip to valid pixel values\n    adversarial = tf.clip_by_value(adversarial, 0, 1)\n    \n    return adversarial.numpy()',
        },
        likes: 132,
        comments: 28,
        shares: 45,
        createdAt: "5d ago",
      },
    ],
  }

  return (
    <div className="min-h-screen">
      <MainNav />
      <div className="container grid grid-cols-1 md:grid-cols-12 gap-6 py-6">
        <aside className="hidden md:block md:col-span-3">
          <Sidebar className="sticky top-20" />
        </aside>

        <main className="md:col-span-9 space-y-6">
          {/* Profile header */}
          <div className="relative">
            {/* Cover image */}
            <div className="h-48 rounded-t-lg overflow-hidden code-rain">
              <div className="w-full h-full bg-gradient-to-r from-black/60 to-black/40"></div>
            </div>

            {/* Profile info */}
            <div className="p-6 border border-border/40 rounded-b-lg bg-background/80 backdrop-blur-sm">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Avatar */}
                <div className="flex-shrink-0 -mt-16 md:-mt-20">
                  <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-background glow">
                    <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                    <AvatarFallback className="text-2xl">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </div>

                {/* User info */}
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h1 className="text-2xl font-bold font-mono glow-text">{user.name}</h1>
                      <p className="text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>

                  <p className="mt-4">{user.bio}</p>

                  <div className="mt-4 flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {user.location && (
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        <span>{user.location}</span>
                      </div>
                    )}
                    {user.website && (
                      <div className="flex items-center gap-1">
                        <LinkIcon className="h-4 w-4" />
                        <a
                          href={user.website}
                          className="text-neon-green hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {user.website.replace(/^https?:\/\//, "")}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>{user.joinedDate}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-4">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{user.following}</span>
                      <span className="text-muted-foreground">Following</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="font-semibold">{user.followers}</span>
                      <span className="text-muted-foreground">Followers</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Profile content */}
          <Tabs defaultValue="posts" className="w-full">
            <TabsList className="grid grid-cols-4 mb-6 bg-muted/30">
              <TabsTrigger
                value="posts"
                className="data-[state=active]:bg-muted/50 data-[state=active]:text-neon-green"
              >
                <FileCode className="mr-2 h-4 w-4" />
                Posts
              </TabsTrigger>
              <TabsTrigger
                value="media"
                className="data-[state=active]:bg-muted/50 data-[state=active]:text-neon-green"
              >
                <ImageIcon className="mr-2 h-4 w-4" />
                Media
              </TabsTrigger>
              <TabsTrigger
                value="comments"
                className="data-[state=active]:bg-muted/50 data-[state=active]:text-neon-green"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Comments
              </TabsTrigger>
              <TabsTrigger
                value="bookmarks"
                className="data-[state=active]:bg-muted/50 data-[state=active]:text-neon-green"
              >
                <Bookmark className="mr-2 h-4 w-4" />
                Bookmarks
              </TabsTrigger>
            </TabsList>

            <TabsContent value="posts" className="space-y-4 mt-0">
              {user.posts.map((post) => (
                <PostCard key={post.id} post={post} />
              ))}
            </TabsContent>

            <TabsContent value="media" className="mt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="aspect-square rounded-md overflow-hidden border border-border/40">
                  <img
                    src="/placeholder.svg?height=300&width=300"
                    alt="Media content"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square rounded-md overflow-hidden border border-border/40">
                  <img
                    src="/placeholder.svg?height=300&width=300"
                    alt="Media content"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="aspect-square rounded-md overflow-hidden border border-border/40">
                  <img
                    src="/placeholder.svg?height=300&width=300"
                    alt="Media content"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="comments" className="mt-0">
              <div className="flex items-center justify-center h-40 border border-dashed rounded-md border-border/40">
                <p className="text-muted-foreground">Comments will appear here</p>
              </div>
            </TabsContent>

            <TabsContent value="bookmarks" className="mt-0">
              <div className="flex items-center justify-center h-40 border border-dashed rounded-md border-border/40">
                <p className="text-muted-foreground">Bookmarked posts will appear here</p>
              </div>
            </TabsContent>
          </Tabs>
        </main>
      </div>
    </div>
  )
}
