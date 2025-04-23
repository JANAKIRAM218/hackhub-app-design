import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp } from "lucide-react"

interface TrendingTopic {
  id: string
  name: string
  posts: number
}

interface TrendingTopicsProps {
  topics: TrendingTopic[]
}

export function TrendingTopics({ topics }: TrendingTopicsProps) {
  return (
    <Card className="border-border/40 bg-background/80 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-neon-blue" />
          <span>Trending Topics</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic) => (
            <Badge
              key={topic.id}
              variant="outline"
              className="hover:border-neon-blue hover:text-neon-blue cursor-pointer transition-colors"
            >
              #{topic.name}
              <span className="ml-1 text-xs text-muted-foreground">{topic.posts}</span>
            </Badge>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
