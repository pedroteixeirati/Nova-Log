import express from 'express';
import { canPerform } from '../../../shared/authorization/permissions';
import { notFoundError } from '../../../shared/errors/app-error';
import { ensureAllowed } from '../../../shared/http/ensure-allowed';
import { sendErrorResponse } from '../../../shared/http/error-response';
import type { AuthenticatedRequest } from '../../auth/dtos/auth-context';
import { loadAuthContext } from '../../auth/middlewares/load-auth-context.middleware';
import { serializeNovalogEntries, serializeNovalogEntry } from '../serializers/novalog.serializer';
import {
  createNovalogBatch,
  createNovalogEntry,
  deleteNovalogEntry,
  listNovalogEntries,
  novalogPermissions,
  updateNovalogEntry,
} from '../services/novalog.service';

const router = express.Router();

router.get('/novalog/entries', loadAuthContext, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!ensureAllowed(res, canPerform('read', novalogPermissions, req.auth?.role), 'Sem permissao para visualizar lancamentos Novalog.')) {
      return;
    }

    res.json(serializeNovalogEntries(await listNovalogEntries(req.auth)));
  } catch (error) {
    next(error);
  }
});

router.post('/novalog/entries', loadAuthContext, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!ensureAllowed(res, canPerform('create', novalogPermissions, req.auth?.role), 'Sem permissao para criar lancamentos Novalog.')) {
      return;
    }

    res.status(201).json(serializeNovalogEntry(await createNovalogEntry(req.auth, req.body as Record<string, unknown>)));
  } catch (error) {
    next(error);
  }
});

router.post('/novalog/entries/batch', loadAuthContext, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!ensureAllowed(res, canPerform('create', novalogPermissions, req.auth?.role), 'Sem permissao para criar lotes Novalog.')) {
      return;
    }

    res.status(201).json(serializeNovalogEntries(await createNovalogBatch(req.auth, req.body as Record<string, unknown>)));
  } catch (error) {
    next(error);
  }
});

router.put('/novalog/entries/:id', loadAuthContext, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!ensureAllowed(res, canPerform('update', novalogPermissions, req.auth?.role), 'Sem permissao para editar lancamentos Novalog.')) {
      return;
    }

    const updated = await updateNovalogEntry(req.auth, req.params.id, req.body as Record<string, unknown>);
    if (updated === undefined) {
      sendErrorResponse(res, notFoundError('Registro nao encontrado.', 'novalog_entry_not_found'));
      return;
    }

    res.json(serializeNovalogEntry(updated));
  } catch (error) {
    next(error);
  }
});

router.delete('/novalog/entries/:id', loadAuthContext, async (req: AuthenticatedRequest, res, next) => {
  try {
    if (!ensureAllowed(res, canPerform('delete', novalogPermissions, req.auth?.role), 'Sem permissao para excluir lancamentos Novalog.')) {
      return;
    }

    const deleted = await deleteNovalogEntry(req.auth, req.params.id);
    if (!deleted) {
      sendErrorResponse(res, notFoundError('Registro nao encontrado.', 'novalog_entry_not_found'));
      return;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

export default router;
