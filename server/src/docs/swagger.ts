import swaggerJSDoc from 'swagger-jsdoc';

const swaggerDefinition: swaggerJSDoc.SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'SnapCal API',
    version: '1.0.0',
    description:
      'REST API for SnapCal: authentication, user profile, social posts, comments, and AI helpers. ' +
      'Protected routes require a JWT access token: `Authorization: Bearer <token>`.',
  },
  servers: [
    {
      url: '/',
      description: 'Same origin as this server (e.g. http://localhost:3000)',
    },
  ],
  tags: [
    { name: 'System', description: 'Health and static assets' },
    { name: 'Auth', description: 'Register, login, refresh, Google placeholder' },
    { name: 'Profile', description: 'Current user profile' },
    { name: 'Comments', description: 'Comments on posts' },
    { name: 'Posts', description: 'Feed posts (multipart upload)' },
    { name: 'AI', description: 'Meal analysis and recipe of the day' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token from /api/auth/login or /api/auth/register',
      },
    },
    schemas: {
      Message: {
        type: 'object',
        properties: {
          message: { type: 'string' },
        },
      },
      UserPublic: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          username: { type: 'string' },
          email: { type: 'string' },
          avatar: { type: 'string' },
          avatarUrl: { type: 'string' },
        },
      },
      AuthResponse: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/UserPublic' },
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
        },
      },
      RefreshBody: {
        type: 'object',
        required: ['refreshToken'],
        properties: {
          refreshToken: { type: 'string' },
        },
      },
      RefreshResponse: {
        type: 'object',
        properties: {
          accessToken: { type: 'string' },
          refreshToken: { type: 'string' },
        },
      },
      RegisterBody: {
        type: 'object',
        required: ['email', 'username', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          username: { type: 'string' },
          password: { type: 'string' },
        },
      },
      LoginBody: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: { type: 'string', format: 'email' },
          password: { type: 'string' },
        },
      },
      GoogleBody: {
        type: 'object',
        required: ['email', 'username'],
        properties: {
          email: { type: 'string', format: 'email' },
          username: { type: 'string' },
        },
      },
      ProfileUpdateBody: {
        type: 'object',
        properties: {
          username: { type: 'string' },
          avatarUrl: { type: 'string', format: 'uri' },
        },
      },
      CommentCreateBody: {
        type: 'object',
        required: ['postId', 'text'],
        properties: {
          postId: { type: 'string', description: 'Mongo ObjectId of the post' },
          text: { type: 'string' },
        },
      },
      AnalyzeBody: {
        type: 'object',
        required: ['description'],
        properties: {
          description: { type: 'string', maxLength: 1000 },
        },
      },
      AnalyzeResult: {
        type: 'object',
        properties: {
          mealName: { type: 'string' },
          calories: { type: 'number' },
          protein: { type: 'number' },
          carbs: { type: 'number' },
          fat: { type: 'number' },
        },
      },
    },
  },
  paths: {
    '/health': {
      get: {
        tags: ['System'],
        summary: 'Health check',
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { status: { type: 'string', example: 'ok' } },
                },
              },
            },
          },
        },
      },
    },
    '/api/auth/register': {
      post: {
        tags: ['Auth'],
        summary: 'Register a new user',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RegisterBody' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Created',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
          '409': { description: 'User already exists', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
          '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login with email and password',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/LoginBody' },
            },
          },
        },
        responses: {
          '200': {
            description: 'OK',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
          '401': { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        },
      },
    },
    '/api/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/RefreshBody' },
            },
          },
        },
        responses: {
          '200': {
            description: 'OK',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/RefreshResponse' } } },
          },
          '400': { description: 'Missing refresh token', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
          '401': { description: 'Invalid refresh token', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        },
      },
    },
    '/api/auth/google': {
      post: {
        tags: ['Auth'],
        summary: 'Google sign-in (placeholder — verify ID token in production)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/GoogleBody' },
            },
          },
        },
        responses: {
          '200': {
            description: 'OK',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AuthResponse' } } },
          },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        },
      },
    },
    '/api/profile/me': {
      get: {
        tags: ['Profile'],
        summary: 'Get current user profile',
        security: [{ bearerAuth: [] }],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { user: { $ref: '#/components/schemas/UserPublic' } },
                },
              },
            },
          },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
          '404': { description: 'User not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        },
      },
      put: {
        tags: ['Profile'],
        summary: 'Update current user profile',
        security: [{ bearerAuth: [] }],
        requestBody: {
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProfileUpdateBody' },
            },
          },
        },
        responses: {
          '200': {
            description: 'Updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    message: { type: 'string' },
                    user: { $ref: '#/components/schemas/UserPublic' },
                  },
                },
              },
            },
          },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
          '409': { description: 'Conflict (e.g. username taken)', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        },
      },
    },
    '/api/comments': {
      post: {
        tags: ['Comments'],
        summary: 'Create a comment on a post',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CommentCreateBody' },
            },
          },
        },
        responses: {
          '201': { description: 'Created', content: { 'application/json': { schema: { type: 'object' } } } },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        },
      },
    },
    '/api/comments/post/{postId}': {
      get: {
        tags: ['Comments'],
        summary: 'List comments for a post (newest first)',
        parameters: [
          {
            name: 'postId',
            in: 'path',
            required: true,
            schema: { type: 'string' },
            description: 'Mongo ObjectId of the post',
          },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: { 'application/json': { schema: { type: 'array', items: { type: 'object' } } } },
          },
          '400': { description: 'Invalid post id', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        },
      },
    },
    '/api/posts': {
      get: {
        tags: ['Posts'],
        summary: 'List posts (paginated)',
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'limit', in: 'query', schema: { type: 'integer', default: 10 } },
          { name: 'author', in: 'query', schema: { type: 'string' }, description: 'Filter by author user id' },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: { 'application/json': { schema: { type: 'array', items: { type: 'object' } } } },
          },
        },
      },
      post: {
        tags: ['Posts'],
        summary: 'Create a post (multipart: image + fields)',
        security: [{ bearerAuth: [] }],
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image', 'calories'],
                properties: {
                  image: { type: 'string', format: 'binary' },
                  description: { type: 'string' },
                  calories: { type: 'string' },
                  protein: { type: 'string' },
                  carbs: { type: 'string' },
                  fat: { type: 'string' },
                  mealName: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Created', content: { 'application/json': { schema: { type: 'object' } } } },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
          '401': { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        },
      },
    },
    '/api/posts/{id}': {
      put: {
        tags: ['Posts'],
        summary: 'Update a post (author only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        requestBody: {
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                properties: {
                  image: { type: 'string', format: 'binary' },
                  description: { type: 'string' },
                  calories: { type: 'string' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { type: 'object' } } } },
          '403': { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
          '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        },
      },
      delete: {
        tags: ['Posts'],
        summary: 'Delete a post (author only)',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
          '403': { description: 'Forbidden', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
          '404': { description: 'Not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        },
      },
    },
    '/api/posts/{id}/like': {
      post: {
        tags: ['Posts'],
        summary: 'Toggle like on a post',
        security: [{ bearerAuth: [] }],
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': {
            description: 'OK',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    likes: { type: 'number' },
                    isLiked: { type: 'boolean' },
                  },
                },
              },
            },
          },
          '404': { description: 'Post not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        },
      },
    },
    '/api/ai/recipe-of-the-day': {
      get: {
        tags: ['AI'],
        summary: 'Get or generate recipe of the day',
        responses: {
          '200': { description: 'OK', content: { 'application/json': { schema: { type: 'object' } } } },
          '500': { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        },
      },
    },
    '/api/ai/analyze': {
      post: {
        tags: ['AI'],
        summary: 'Analyze meal description with AI',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/AnalyzeBody' },
            },
          },
        },
        responses: {
          '200': {
            description: 'OK',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AnalyzeResult' } } },
          },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        },
      },
    },
    '/api/ai/analyze-image': {
      post: {
        tags: ['AI'],
        summary: 'Analyze meal image with AI',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['image'],
                properties: {
                  image: { type: 'string', format: 'binary' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'OK',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/AnalyzeResult' } } },
          },
          '400': { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Message' } } } },
        },
      },
    },
    '/uploads/{filename}': {
      get: {
        tags: ['System'],
        summary: 'Static uploaded image file',
        parameters: [
          { name: 'filename', in: 'path', required: true, schema: { type: 'string' } },
        ],
        responses: {
          '200': { description: 'Image file' },
          '404': { description: 'Not found' },
        },
      },
    },
  },
};

const options: swaggerJSDoc.Options = {
  definition: swaggerDefinition,
  apis: [],
};

export const swaggerSpec = swaggerJSDoc(options);
