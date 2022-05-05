import { middyZodValidator } from '../middy-zod-validator';
import { z } from 'zod';
import { Context } from 'aws-lambda';

const inputBodySchema = z.object({
    num: z.number(),
    str: z.string(),
});

const inputQueryStringParametersSchema = z.object({
    first: z.string(),
    second: z.string(),
});

const inputPathParametersSchema = z.object({
    path: z.string(),
});

const outputBodySchema = z.object({
    num: z.number(),
});

test('It should parse a correct input body', async () => {
    const validator =
        middyZodValidator({ inputBodySchema }).before ??
        (() => {
            throw 'error';
        });

    await expect(
        validator({
            event: { body: { num: 42, str: 'the answer' } },
            context: {} as Context,
            response: null,
            error: null,
            internal: {},
        }),
    ).resolves.not.toThrow();
});

test('It should reject an incorrect input body', async () => {
    const validator =
        middyZodValidator({ inputBodySchema }).before ??
        (() => {
            throw 'error';
        });

    await expect(
        validator({
            event: { body: { num: 'not a number', str: 'a string' } },
            context: {} as Context,
            response: null,
            error: null,
            internal: {},
        }),
    ).rejects.toStrictEqual({
        message: 'Input Validation Error',
        statusCode: 400,
    });
});

test('It should parse correct input query params', async () => {
    const validator =
        middyZodValidator({ inputQueryStringParametersSchema }).before ??
        (() => {
            throw 'error';
        });

    await expect(
        validator({
            event: {
                queryStringParameters: { first: 'first', second: 'second' },
            },
            context: {} as Context,
            response: null,
            error: null,
            internal: {},
        }),
    ).resolves.not.toThrow();
});

test('It should reject incorrect input query params', async () => {
    const validator =
        middyZodValidator({ inputQueryStringParametersSchema }).before ??
        (() => {
            throw 'error';
        });

    await expect(
        validator({
            event: {
                queryStringParameters: { first: 'first' },
            },
            context: {} as Context,
            response: null,
            error: null,
            internal: {},
        }),
    ).rejects.toStrictEqual({
        message: 'Input Validation Error',
        statusCode: 400,
    });
});

test('It should parse correct path params', async () => {
    const validator =
        middyZodValidator({ inputPathParametersSchema }).before ??
        (() => {
            throw 'error';
        });

    await expect(
        validator({
            event: {
                pathParameters: { path: 'Hello, world!' },
            },
            context: {} as Context,
            response: null,
            error: null,
            internal: {},
        }),
    ).resolves.not.toThrow();
});

test('It should reject incorrect path params', async () => {
    const validator =
        middyZodValidator({ inputPathParametersSchema }).before ??
        (() => {
            throw 'error';
        });

    await expect(
        validator({
            event: {
                pathParameters: { notPath: 'Hello, world!' },
            },
            context: {} as Context,
            response: null,
            error: null,
            internal: {},
        }),
    ).rejects.toStrictEqual({
        message: 'Input Validation Error',
        statusCode: 400,
    });
});

test('It should parse correct combined input types', async () => {
    const validator =
        middyZodValidator({
            inputBodySchema,
            inputQueryStringParametersSchema,
            inputPathParametersSchema,
        }).before ??
        (() => {
            throw 'error';
        });

    await expect(
        validator({
            event: {
                body: { num: 42, str: 'the answer' },
                queryStringParameters: { first: 'first', second: 'second' },
                pathParameters: { path: 'Hello, world!' },
            },
            context: {} as Context,
            response: null,
            error: null,
            internal: {},
        }),
    ).resolves.not.toThrow();
});

test('It should parse a correct output body', async () => {
    const validator =
        middyZodValidator({ outputBodySchema }).after ??
        (() => {
            throw 'error';
        });

    await expect(
        validator({
            event: {},
            context: {} as Context,
            response: { body: { num: 1234 } },
            error: null,
            internal: {},
        }),
    ).resolves.not.toThrow();
});

test('It should reject an incorrect output body', async () => {
    const validator =
        middyZodValidator({ outputBodySchema }).after ??
        (() => {
            throw 'error';
        });

    await expect(
        validator({
            event: {},
            context: {} as Context,
            response: { body: { num: 'not a number' } },
            error: null,
            internal: {},
        }),
    ).rejects.toStrictEqual({
        message: 'Output Validation Error',
        statusCode: 500,
    });
});

test('It should call the provided input error function', async () => {
    const inputErrorHandler = jest.fn(() => {
        return;
    });

    const validator =
        middyZodValidator({ inputBodySchema, inputErrorHandler }).before ??
        (() => {
            throw 'error';
        });

    await validator({
        event: { body: { num: 'not a number', str: 'a string' } },
        context: {} as Context,
        response: null,
        error: null,
        internal: {},
    });

    expect(inputErrorHandler).toHaveBeenCalled();
});

test('It should call the provided output error function', async () => {
    const outputErrorHandler = jest.fn(() => {
        return;
    });

    const validator =
        middyZodValidator({ outputBodySchema, outputErrorHandler }).after ??
        (() => {
            throw 'error';
        });

    await validator({
        event: {},
        context: {} as Context,
        response: { body: { num: 'not a number' } },
        error: null,
        internal: {},
    });

    expect(outputErrorHandler).toHaveBeenCalled();
});
