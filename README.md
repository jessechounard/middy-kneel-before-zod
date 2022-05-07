# Kneel Before Zod

## **An input and output validator middleware for [zod](https://github.com/colinhacks/zod) using [middy](https://github.com/middyjs/middy)**

This middleware automatically validates the inputs and output of events in AWS Lambda. It currently handles input in the request body, query string parameters, and path parameters, and output in the response body.

If an incoming event fails validation a `BadRequest` error is raised. If an outgoing response fails validation a `InternalServerError` error is raised. Optional user callbacks can be provided if you would prefer to raise a custom error instead. This middleware can be used in combination with [httpErrorHandler](https://github.com/middyjs/middy/tree/main/packages/validator#httperrorhandler) to automatically return this response to the user.

When using http request body input, it is recommended that a body parser middleware (like [http-json-body-parser](https://github.com/middyjs/middy/tree/main/packages/http-json-body-parser)) is used to parse the string input into the correct object type. Make sure you put it in the middy `.use` chain before this middleware.

Similarly, if using a body output with an API Gateway event, you'll need to make sure that the output is stringified before being sent out. A middleware like [http-response-serializer](https://github.com/middyjs/middy/tree/main/packages/http-response-serializer) works nicely for this. It also needs to be included in the middy `.use` chain before this middleware. (Because the `after` actions are processed in the opposite order of the `before` actions.)

## Installation

```bash
npm i middy-kneel-before-zod
```

## Configuration

The middleware is configured by passing in a configuration object. All of the properties on the configuration object are optional. The properties are:

Four schema types: (zod schemas created from `z.object()`)

-   `inputBodySchema`
-   `inputPathParametersSchema`
-   `inputQueryStringParametersSchema`
-   `outputBodySchema`

And two callback handler functions:

-   `inputErrorHandler(error: z.ZodError): void`
-   `outputErrorHandler(error: z.ZodError): void`

## Sample usage

```ts
import middy from '@middy/core';
import middyJsonBodyParser from '@middy/http-json-body-parser';
import httpResponseSerializer from '@middy/http-response-serializer';
import { middyZodValidator } from 'middy-zod-validator';
import { z } from 'zod';

const handler = middy((event, context) => {
    return {};
});

const personSchema = z.object({
    firstName: z.string(),
    lastName: z.string(),
    age: z.number(),
});

const responseSchema = z.object({
    message: string,
});

handler
    .use(middyJsonBodyParser())
    .use(httpErrorHandler())
    .use(
        httpResponseSerializer({
            serializers: [
                {
                    regex: /^application\/json$/,
                    serializer: ({ body }) => JSON.stringify(body),
                },
            ],
            default: 'application/json',
        }),
    )
    .use(
        middyZodValidator({
            inputBodySchema: person,
            outputBodySchema: responseSchema,
        }),
    );

// The types to use in your event code would be something like:
// type Person = z.infer<typeof personSchema>;
// type Response = z.infer<typeof responseSchema>;
```

## Contributing

Everyone is very welcome to contribute to this repository. Feel free to [raise issues](https://github.com/jessechounard/middy-kneel-before-zod/issues) or to [submit Pull Requests](https://github.com/jessechounard/middy-kneel-before-zod/pulls).
