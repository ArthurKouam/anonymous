import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Message from 'App/Models/Message';
import User from 'App/Models/User';

export default class MessagesController {

  async saveMessage({ request, view, session, response }: HttpContextContract){
    const pseudo = request.param('pseudo');
    console.log(pseudo)
    const { message }: {message: string} = request.only(['message']);
    const user = await User.findBy('pseudo', pseudo)
    console.log(user)
    if(user){
      await Message.create({
        content: message.trim(),
        ref_user: user.id
      })
      
      session.flash('succes', 'Votre message aété envoyé avec succes');
      return response.redirect().back()
    }else{
      return view.render('errors/not-found-user')
    }
  }

  async getAllMessage({ request, view, auth }: HttpContextContract){
    const pseudo = request.param('pseudo');

    const user = await User.findBy('pseudo', pseudo);

    if(user && auth.user?.pseudo === pseudo){
      const messages = await Message.all();
      const formattedMessages = messages.map((message) => ({
        ...message.toJSON(),
        created_at: (message.createdAt.toISO()!), // Convertir en DateTime
      }));
      return view.render('page/message', {pseudo: user.pseudo, messages: formattedMessages})
    }else{
      return view.render('errors/not-found-user', { pseudo })
    }
  }

  async getMessage({ request, view, auth, response }: HttpContextContract){
    const pseudo = request.param('pseudo');
    const messageId = request.param('message');

    const message = await Message.find(messageId)

    if (auth.user?.pseudo === pseudo) {
      if(message) return view.render('page/getmessage', {message, pseudo})
      else return view.render('errors/not-found-message')
    }else{
      response.redirect().back();
    }
  }
}
