/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

import { z } from 'zod';

/*
 * NOTICE: Do not edit this file manually.
 * This file is automatically generated by the OpenAPI Generator, @kbn/openapi-generator.
 *
 * info:
 *   title: Create Conversation API endpoint
 *   version: 1
 */

import {
  ConversationCreateProps,
  ConversationResponse,
  ConversationUpdateProps,
  ConversationMessageCreateProps,
} from './common_attributes.gen';
import { NonEmptyString } from '../common_attributes.gen';

export type AppendConversationMessageRequestParams = z.infer<
  typeof AppendConversationMessageRequestParams
>;
export const AppendConversationMessageRequestParams = z.object({
  /**
   * The conversation's `id` value.
   */
  id: NonEmptyString,
});
export type AppendConversationMessageRequestParamsInput = z.input<
  typeof AppendConversationMessageRequestParams
>;

export type AppendConversationMessageRequestBody = z.infer<
  typeof AppendConversationMessageRequestBody
>;
export const AppendConversationMessageRequestBody = ConversationMessageCreateProps;
export type AppendConversationMessageRequestBodyInput = z.input<
  typeof AppendConversationMessageRequestBody
>;

export type AppendConversationMessageResponse = z.infer<typeof AppendConversationMessageResponse>;
export const AppendConversationMessageResponse = ConversationResponse;

export type CreateConversationRequestBody = z.infer<typeof CreateConversationRequestBody>;
export const CreateConversationRequestBody = ConversationCreateProps;
export type CreateConversationRequestBodyInput = z.input<typeof CreateConversationRequestBody>;

export type CreateConversationResponse = z.infer<typeof CreateConversationResponse>;
export const CreateConversationResponse = ConversationResponse;

export type DeleteConversationRequestParams = z.infer<typeof DeleteConversationRequestParams>;
export const DeleteConversationRequestParams = z.object({
  /**
   * The conversation's `id` value.
   */
  id: NonEmptyString,
});
export type DeleteConversationRequestParamsInput = z.input<typeof DeleteConversationRequestParams>;

export type DeleteConversationResponse = z.infer<typeof DeleteConversationResponse>;
export const DeleteConversationResponse = ConversationResponse;

export type ReadConversationRequestParams = z.infer<typeof ReadConversationRequestParams>;
export const ReadConversationRequestParams = z.object({
  /**
   * The conversation's `id` value.
   */
  id: NonEmptyString,
});
export type ReadConversationRequestParamsInput = z.input<typeof ReadConversationRequestParams>;

export type ReadConversationResponse = z.infer<typeof ReadConversationResponse>;
export const ReadConversationResponse = ConversationResponse;

export type UpdateConversationRequestParams = z.infer<typeof UpdateConversationRequestParams>;
export const UpdateConversationRequestParams = z.object({
  /**
   * The conversation's `id` value.
   */
  id: NonEmptyString,
});
export type UpdateConversationRequestParamsInput = z.input<typeof UpdateConversationRequestParams>;

export type UpdateConversationRequestBody = z.infer<typeof UpdateConversationRequestBody>;
export const UpdateConversationRequestBody = ConversationUpdateProps;
export type UpdateConversationRequestBodyInput = z.input<typeof UpdateConversationRequestBody>;

export type UpdateConversationResponse = z.infer<typeof UpdateConversationResponse>;
export const UpdateConversationResponse = ConversationResponse;
