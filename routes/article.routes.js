import { Router } from 'express';
import {
  createArticle,
  deleteArticle,
  getArticle,
  getAllArticle,
  modifyArticle,
  filterArticle,
  searchArticle,
} from '../controllers/article.controller.js';

import { validate } from '../middlewares/validate.js';
import {
  createArticleSchema,
  updateArticleSchema,
  searchSchema,
  filterSchema,
  idParamSchema,
} from '../validators/article.validator.js';

const articleRouter = Router();

articleRouter.get('/search', validate(searchSchema, 'query'), searchArticle);
articleRouter.get('/filter', validate(filterSchema, 'query'), filterArticle);
articleRouter.get('/', getAllArticle);
articleRouter.get('/:id', validate(idParamSchema, 'params'), getArticle);
articleRouter.post('/', validate(createArticleSchema), createArticle);
articleRouter.patch(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(updateArticleSchema),
  modifyArticle,
);
articleRouter.delete('/:id', deleteArticle);

export default articleRouter;
