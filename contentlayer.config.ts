import { defineDocumentType, makeSource } from 'contentlayer2/source-files'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

export const Post = defineDocumentType(() => ({
  name: 'Post',
  filePathPattern: `blog/**/*.md`,
  contentType: 'markdown',
  fields: {
    title: {
      type: 'string',
      required: true,
    },
    date: {
      type: 'date',
      required: true,
    },
    excerpt: {
      type: 'string',
      required: true,
    },
    category: {
      type: 'string',
      required: false,
    },
    author: {
      type: 'string',
      required: false,
    },
    image: {
      type: 'string',
      required: false,
    },
  },
  computedFields: {
    slug: {
      type: 'string',
      resolve: (post) => post._raw.flattenedPath.replace('blog/', ''),
    },
    readTime: {
      type: 'string',
      resolve: (post) => {
        const wordsPerMinute = 200
        const words = post.body.raw.split(/\s+/).length
        const minutes = Math.ceil(words / wordsPerMinute)
        return `${minutes} min`
      },
    },
  },
}))

export default makeSource({
  contentDirPath: 'content',
  documentTypes: [Post],
  markdown: {
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          theme: 'one-dark-pro',
          keepBackground: false,
          onVisitLine(node: any) {
            // Prevent lines from collapsing in `display: grid` mode
            if (node.children.length === 0) {
              node.children = [{ type: 'text', value: ' ' }]
            }
          },
          onVisitHighlightedLine(node: any) {
            node.properties.className = ['highlighted']
          },
        },
      ],
      [
        rehypeAutolinkHeadings,
        {
          properties: {
            className: ['anchor'],
          },
        },
      ],
    ],
  },
})
