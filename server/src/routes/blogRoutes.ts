import { Router, Request, Response, NextFunction } from 'express'
import { db } from '../db/store.js'

const router = Router()

// GET /api/v1/blogs - List all published blogs
router.get('/', async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const customBlogs = Array.from(db.blogs.values())
    res.json({
      success: true,
      data: customBlogs,
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/blogs/:slug - Get blog by slug or ID
router.get('/:slug', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { slug } = req.params
    let blog = db.blogs.get(slug)
    if (!blog) {
      // Also check by ID or slug match
      blog = Array.from(db.blogs.values()).find(
        (b: any) => b.slug === slug || b.id === slug
      )
    }

    if (!blog) {
      res.status(404).json({
        success: false,
        error: { code: 'BLOG_NOT_FOUND', message: 'Blog article not found' },
      })
      return
    }

    res.json({
      success: true,
      data: blog,
    })
  } catch (err) {
    next(err)
  }
})

export default router
