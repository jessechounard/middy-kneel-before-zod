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
        const processError = (error: z.ZodError) => {
            if (config.inputErrorHandler) {
                config.inputErrorHandler(error);
            } else {
                throw { statusCode: 400, message: 'Input Validation Error' };
            }
        };
        const bodyResult = config.inputBodySchema?.safeParse(
            request.event.body,
        );
        const pathParametersResult =
            config.inputPathParametersSchema?.safeParse(
                request.event.pathParameters,
            );
        const queryStringParametersResult =
            config.inputQueryStringParametersSchema?.safeParse(
                request.event.queryStringParameters,
            );

        if (bodyResult && !bodyResult.success) {
            processError(bodyResult.error);
        }
        if (pathParametersResult && !pathParametersResult.success) {
            processError(pathParametersResult.error);
        }
        if (
            queryStringParametersResult &&
            !queryStringParametersResult.success
        ) {
            processError(queryStringParametersResult.error);
        }
    }

    async function outputValidator(request: {
        response: { body: z.infer<OutputBodySchema> };
    }): Promise<void> {
        const processError = (error: z.ZodError) => {
            if (config.outputErrorHandler) {
                config.outputErrorHandler(error);
            } else {
                throw { statusCode: 500, message: 'Output Validation Error' };
            }
        };
        const bodyResult = config.outputBodySchema?.safeParse(
            request.response.body,
        );

        if (bodyResult && !bodyResult.success) {
            processError(bodyResult.error);
        }
    }

    return {
        before: inputValidator,
        after: outputValidator,
    };
}
