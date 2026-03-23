import prisma from '../database/sqlite.js';

export const createArticle = async (req, res, next) => {
  const {
    title,
    userId,
    userName,
    categories = [],
    tags = [],
    content,
  } = req.body;

  let userConnect;

  if (userId) {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (!existingUser)
      return res.status(404).json({ error: `User ${userId} non found` });
    userConnect = { connect: { id: userId } };
  } else if (userName) {
    userConnect = {
      connectOrCreate: {
        where: { name: userName },
        create: { name: userName },
      },
    };
  }
  try {
    const article = await prisma.article.create({
      data: {
        title,
        content,

        user: userConnect,

        categories: {
          connectOrCreate: categories.map((name) => ({
            where: { name },
            create: { name },
          })),
        },

        tags: {
          connectOrCreate: tags.map((name) => ({
            where: { name },
            create: { name },
          })),
        },
      },
    });
    res.status(201).json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: 'Failed to create article',
    });
  }
};
export const getAllArticle = async (req, res, next) => {
  try {
    const articles = await prisma.article.findMany({
      include: { tags: true, categories: true },
    });
    res.json({
      success: true,
      data: articles,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
};
export const getArticle = async (req, res, next) => {
  const { id } = req.params;
  try {
    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) return res.status(404).json({ error: 'Article not found' });
    res.status(200).json({
      success: true,
      data: article,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch the article' });
  }
};
export const modifyArticle = async (req, res, next) => {
  const id = Number(req.params.id);
  const data = req.body;

  try {
    const article = await prisma.article.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.content && { content: data.content }),
        ...(data.categories && {
          categories: {
            set: [],
            connectOrCreate: data.categories.map((name) => ({
              where: { name },
              create: { name },
            })),
          },
        }),

        ...(data.tags && {
          tags: {
            set: [],
            connectOrCreate: data.tags.map((name) => ({
              where: { name },
              create: { name },
            })),
          },
        }),
      },
    });
    res.status(200).json(article);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update article' });
  }
};
export const deleteArticle = async (req, res, next) => {
  const id = Number(req.params.id);

  try {
    const deleted = await prisma.article.delete({ where: { id } });

    res
      .status(200)
      .json({ message: 'Article deleted successfully', article: deleted });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete article' });
  }
};
export const searchArticle = async (req, res, next) => {
  const query = req.query.q;
  try {
    const articles = await prisma.article.findMany({
      where: {
        OR: [
          { content: { contains: query, mode: 'insensitive' } },
          { title: { contains: query, mode: 'insensitive' } },
          { user: { name: { contains: query, mode: 'insensitive' } } },
        ],
      },
      include: { tags: true, categories: true, user: true },
      take: 10,
      order: { updatedAt: 'desc' },
    });
    res.status(200).json({ articles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
};
export const filterArticle = async (req, res, next) => {
  try {
    const { userName, categories, tags, date } = req.query;

    const where = {};

    if (userName) {
      where.user = {
        name: { contains: userName },
      };
    }

    if (categories) {
      where.AND = [
        ...(where.AND || []),
        ...categories.map((cat) => ({
          categories: { some: { name: cat } },
        })),
      ];
    }

    if (tags) {
      where.AND = [
        ...(where.AND || []),
        ...tags.map((tag) => ({
          tags: { some: { name: tag } },
        })),
      ];
    }

    if (date) {
      where.createdAt = {
        gte: date.start,
        lte: date.end,
      };
    }

    const articles = await prisma.article.findMany({
      where,
      take: 10,
    });

    res.status(200).json({ articles });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to filter articles' });
  }
};
