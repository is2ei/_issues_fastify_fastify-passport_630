import crypto from 'node:crypto'
import fastify from 'fastify'
import fastifyPassport from '@fastify/passport'
import fastifySecureSession from '@fastify/secure-session'
import LocalStrategy from 'passport-local'

const server = fastify({
  logger: {
    level: 'trace'
  }
})

server.register(fastifySecureSession, { key: crypto.randomBytes(32) })
server.register(fastifyPassport.initialize())
server.register(fastifyPassport.secureSession())

fastifyPassport.use(new LocalStrategy(
  function(username, password, done) {
    return done(null, false, { message: "Invalid password", status: 401 })
  }
))

server.get(
  '/',
  {
    preValidation: fastifyPassport.authenticate(
      'local',
      {
        authInfo: false,
      },
      async function (request, reply, err, user, info, status) {
        if (!user) {
          return await reply.code(info.status).send(info.message)
        }
      }
    )
  },
  async () => 'hello world!'
)


server.listen({ port: 8000 })
