"use client"

import { useState, useCallback, useEffect } from "react"

// Mock post data type
interface Post {
  id: string
  user: {
    name: string
    username: string
    avatar: string
  }
  content: string
  image?: string
  code?: {
    language: string
    content: string
  }
  likes: number
  comments: number
  shares: number
  createdAt: string
}

// Generate a large set of mock posts
const generateMockPosts = (count: number): Post[] => {
  const posts: Post[] = []

  const users = [
    {
      name: "Alex Chen",
      username: "alexc0der",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "Sophia Kim",
      username: "sophiadev",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "Marcus Johnson",
      username: "mjhacker",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "Tech Innovator",
      username: "techinnovator",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    {
      name: "AI Research Lab",
      username: "airesearchlab",
      avatar: "/placeholder.svg?height=40&width=40",
    },
  ]

  const contents = [
    "Just discovered this amazing vulnerability in a popular web framework. Always validate your inputs, folks! #cybersecurity #hacking",
    "Check out my new neural network architecture for image recognition. It's 30% faster than the current state-of-the-art! #AI #MachineLearning",
    "Just built this cool terminal dashboard for monitoring network traffic. The visualization is all in ASCII art! #networking #terminal",
    "Just released our new quantum encryption library. 100x faster than traditional methods with unbreakable security! #quantumcomputing #cybersecurity",
    "We've trained an AI model that can generate secure code and identify vulnerabilities automatically. Open-sourcing next week! #AI #securecodegen",
    "Just discovered a backdoor in a popular IoT device. Manufacturers need to take security seriously! #IoTSecurity #hacking",
    "My latest research on neural network vulnerabilities is now published. #AI #security",
    "Just automated our entire CI/CD pipeline with this custom script. Deployment time reduced by 70%! #devops #automation",
    "Just published my comprehensive guide on setting up a secure home lab for penetration testing. Link in comments! #cybersecurity #pentesting",
    "Found a zero-day vulnerability in a major browser. Responsible disclosure in progress. #security #bugbounty",
  ]

  const codeSnippets = [
    {
      language: "python",
      content:
        "import tensorflow as tf\n\nclass ImprovedCNN(tf.keras.Model):\n  def __init__(self):\n    super(ImprovedCNN, self).__init__()\n    self.conv1 = tf.keras.layers.Conv2D(32, 3, activation='relu')\n    self.pool = tf.keras.layers.MaxPooling2D()\n    self.flatten = tf.keras.layers.Flatten()\n    self.dense1 = tf.keras.layers.Dense(128, activation='relu')\n    self.dense2 = tf.keras.layers.Dense(10, activation='softmax')\n    \n  def call(self, x):\n    x = self.conv1(x)\n    x = self.pool(x)\n    x = self.flatten(x)\n    x = self.dense1(x)\n    return self.dense2(x)",
    },
    {
      language: "javascript",
      content:
        "// Example of AI-generated secure code\nfunction sanitizeInput(input) {\n  if (typeof input !== 'string') {\n    throw new TypeError('Input must be a string');\n  }\n  \n  // Remove potentially dangerous characters\n  return input\n    .replace(/[\\u0000-\\u001F\\u007F-\\u009F]/g, '')\n    .replace(/[&<>\"']/g, (char) => {\n      switch (char) {\n        case '&': return '&amp;';\n        case '<': return '&lt;';\n        case '>': return '&gt;';\n        case '\"': return '&quot;';\n        case \"'\": return '&#39;';\n        default: return char;\n      }\n    });\n}",
    },
    {
      language: "bash",
      content:
        '#!/bin/bash\n\n# Automated deployment script\necho "Starting deployment process..."\n\n# Run tests\necho "Running tests..."\nnpm test\n\nif [ $? -eq 0 ]; then\n  echo "Tests passed! Building application..."\n  npm run build\n  \n  if [ $? -eq 0 ]; then\n    echo "Build successful! Deploying to production..."\n    # Deploy to production\n    rsync -avz --delete dist/ user@production-server:/var/www/app/\n    echo "Deployment complete!"\n  else\n    echo "Build failed. Aborting deployment."\n    exit 1\n  fi\nelse\n  echo "Tests failed. Aborting deployment."\n  exit 1\nfi',
    },
    {
      language: "python",
      content:
        'import numpy as np\nimport tensorflow as tf\n\ndef create_adversarial_example(model, image, true_label, epsilon=0.01):\n    """Generate an adversarial example"""\n    image_tensor = tf.convert_to_tensor(image[np.newaxis, ...], dtype=tf.float32)\n    \n    with tf.GradientTape() as tape:\n        tape.watch(image_tensor)\n        prediction = model(image_tensor)\n        loss = tf.keras.losses.sparse_categorical_crossentropy(\n            [true_label], prediction\n        )\n    \n    # Get the gradients\n    gradient = tape.gradient(loss, image_tensor)\n    \n    # Create the adversarial example\n    signed_grad = tf.sign(gradient)\n    adversarial = image + epsilon * signed_grad[0]\n    \n    # Clip to valid pixel values\n    adversarial = tf.clip_by_value(adversarial, 0, 1)\n    \n    return adversarial.numpy()',
    },
    {
      language: "javascript",
      content:
        "import { CryptoShield } from 'cryptoshield';\n\nconst shield = new CryptoShield();\n\n// Generate a secure key pair\nconst keyPair = shield.generateKeyPair();\n\n// Encrypt data\nconst encrypted = shield.encrypt(sensitiveData, keyPair.publicKey);\n\n// Decrypt data\nconst decrypted = shield.decrypt(encrypted, keyPair.privateKey);",
    },
  ]

  const timeAgo = [
    "2m ago",
    "5m ago",
    "15m ago",
    "32m ago",
    "1h ago",
    "2h ago",
    "3h ago",
    "5h ago",
    "6h ago",
    "10h ago",
    "1d ago",
    "2d ago",
    "3d ago",
    "5d ago",
    "1w ago",
  ]

  for (let i = 0; i < count; i++) {
    const user = users[Math.floor(Math.random() * users.length)]
    const content = contents[Math.floor(Math.random() * contents.length)]
    const hasImage = Math.random() > 0.5
    const hasCode = !hasImage && Math.random() > 0.5
    const code = hasCode ? codeSnippets[Math.floor(Math.random() * codeSnippets.length)] : undefined
    const likes = Math.floor(Math.random() * 1000)
    const comments = Math.floor(Math.random() * 200)
    const shares = Math.floor(Math.random() * 100)
    const createdAt = timeAgo[Math.floor(Math.random() * timeAgo.length)]

    posts.push({
      id: `post-${i + 1}`,
      user,
      content,
      image: hasImage ? `/placeholder.svg?height=300&width=600` : undefined,
      code,
      likes,
      comments,
      shares,
      createdAt,
    })
  }

  return posts
}

// All mock posts
const ALL_MOCK_POSTS = generateMockPosts(50)

export function usePosts() {
  const [posts, setPosts] = useState<Post[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const postsPerPage = 5

  // Load initial posts
  useEffect(() => {
    loadInitialPosts()
  }, [])

  const loadInitialPosts = useCallback(() => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      // Check for posts in localStorage
      const storedPosts = localStorage.getItem("hackhub-posts")
      let userPosts = []
      if (storedPosts) {
        try {
          userPosts = JSON.parse(storedPosts)
        } catch (error) {
          console.error("Failed to parse posts:", error)
        }
      }

      // Combine user posts with mock posts, ensuring user posts appear first
      const initialPosts = [...userPosts, ...ALL_MOCK_POSTS.slice(0, postsPerPage - userPosts.length)]
      // Replace this line
      // const initialPosts = ALL_MOCK_POSTS.slice(0, postsPerPage)
      setPosts(initialPosts)
      setHasMore(ALL_MOCK_POSTS.length > postsPerPage)
      setIsLoading(false)
    }, 1000)
  }, [])

  const loadMorePosts = useCallback(() => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      const nextPage = page + 1
      const startIndex = (nextPage - 1) * postsPerPage
      const endIndex = startIndex + postsPerPage

      if (startIndex < ALL_MOCK_POSTS.length) {
        const newPosts = ALL_MOCK_POSTS.slice(startIndex, endIndex)
        setPosts((prevPosts) => [...prevPosts, ...newPosts])
        setPage(nextPage)
        setHasMore(endIndex < ALL_MOCK_POSTS.length)
      } else {
        setHasMore(false)
      }

      setIsLoading(false)
    }, 1000)
  }, [isLoading, hasMore, page])

  return {
    posts,
    loadMorePosts,
    hasMore,
    isLoading,
    refresh: loadInitialPosts,
  }
}

export type { Post }
