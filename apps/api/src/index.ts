import { createYoga, createSchema } from 'graphql-yoga';

type Env = {
	OPENAI_API_KEY: string;
	OPENAI_MODEL: string;
};

type GraphQLContext = { env: Env };

const yoga = createYoga<GraphQLContext>({
	graphqlEndpoint: '/graphql',

	// ✅ 关键：把 Worker 的 env 注入到 GraphQL context
	context: ({ env }) => ({ env }),

	schema: createSchema({
		typeDefs: /* GraphQL */ `
			input ChatMessageInput {
				role: String!
				content: String!
			}

			type ChatResponse {
				reply: String!
			}

			type Query {
				health: String!
			}

			type Mutation {
				chat(messages: [ChatMessageInput!]!): ChatResponse!
			}
		`,
		resolvers: {
			Query: { health: () => 'ok' },
			Mutation: {
				chat: async (_p, args, ctx) => {
					const env = ctx.env; // ✅ 现在一定有
					console.log(ctx, 'ctx');
					console.log(env, 'envenv');
					if (!env.OPENAI_API_KEY) {
						throw new Error('Missing OPENAI_API_KEY (check .dev.vars or wrangler secret).');
					}

					const resp = await fetch('https://api.openai.com/v1/responses', {
						method: 'POST',
						headers: {
							Authorization: `Bearer ${env.OPENAI_API_KEY}`,
							'Content-Type': 'application/json',
						},
						body: JSON.stringify({
							model: env.OPENAI_MODEL ?? 'gpt-4.1-mini',
							input: args.messages.map((m: any) => ({
								role: m.role,
								content: m.content,
							})),
						}),
					});

					if (!resp.ok) {
						const text = await resp.text();
						throw new Error(`OpenAI error: ${resp.status} ${text}`);
					}

					const data: any = await resp.json();
					const reply = data.output_text || data?.output?.[0]?.content?.[0]?.text || '';

					return { reply };
				},
			},
		},
	}),
});

export default {
  fetch(request: Request, env: Env) {
    // ✅ 关键修复点：第二个参数必须是对象
    return yoga.fetch(request, { env });
  },
};
