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
  mdx: {
    rehypePlugins: [
      rehypeSlug,
      [
        rehypePrettyCode,
        {
          theme: 'github-dark',
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
