import middy from '@middy/core';
import { z, ZodType } from 'zod';

export function middyZodValidator<
    InputBodyZodOutputType,
    InputPathParametersZodOutputType,
    InputQueryStringParametersZodOutputType,
    OutputBodyZodOutputType,
    InputBodySchema extends ZodType<InputBodyZodOutputType>,
    InputPathParametersSchema extends ZodType<InputPathParametersZodOutputType>,
    InputQueryStringParametersSchema extends ZodType<InputQueryStringParametersZodOutputType>,
    OutputBodySchema extends ZodType<OutputBodyZodOutputType>,
>(config: {
    inputBodySchema?: InputBodySchema;
    inputPathParametersSchema?: InputPathParametersSchema;
    inputQueryStringParametersSchema?: InputQueryStringParametersSchema;
    outputBodySchema?: OutputBodySchema;
    inputErrorHandler?(error: z.ZodError): void;
    outputErrorHandler?(error: z.ZodError): void;
}): middy.MiddlewareObj {
    async function inputValidator(request: {
        event: {
            body?: z.infer<InputBodySchema>;
            queryStringParameters?: z.infer<InputPathParametersSchema>;
            pathParameters?: z.infer<InputQueryStringParametersSchema>;
        };
    }): Promise<void> {
        try {
            config.inputBodySchema?.parse(request.event.body);
            config.inputPathParametersSchema?.parse(
                request.event.pathParameters,
            );
            config.inputQueryStringParametersSchema?.parse(
                request.event.queryStringParameters,
            );
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                if (config.inputErrorHandler) {
                    config.inputErrorHandler(error);
                } else {
                    throw {
                        statusCode: 400,
                        message: 'Input Validation Error',
                    };
                }
            } else {
                throw error;
            }
        }
    }

    async function outputValidator(request: {
        response: { body: z.infer<OutputBodySchema> };
    }): Promise<void> {
        try {
            config.outputBodySchema?.parse(request.response.body);
        } catch (error: unknown) {
            if (error instanceof z.ZodError) {
                if (config.outputErrorHandler) {
                    config.outputErrorHandler(error);
                } else {
                    throw {
                        statusCode: 500,
                        message: 'Output Validation Error',
                    };
                }
            } else {
                throw error;
            }
        }
    }

    return {
        before: inputValidator,
        after: outputValidator,
    };
}
