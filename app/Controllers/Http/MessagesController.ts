import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import Database from '@ioc:Adonis/Lucid/Database';
import Message from 'App/Models/Message';
import User from 'App/Models/User';

export default class MessagesController {

  async saveMessage({ request, view, session, response }: HttpContextContract){
    const pseudo = request.param('pseudo');
    const { message }: {message: string} = request.only(['message']);
    const user = await User.findBy('pseudo', pseudo)
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
      const messages = await Database
        .from('messages')
        .select('*')
        .where('ref_user', user.id);
      
      return view.render('page/message', {pseudo: user.pseudo, messages})
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
