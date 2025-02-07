import type { HttpContextContract } from '@ioc:Adonis/Core/HttpContext'
import User from 'App/Models/User';
import Application from '@ioc:Adonis/Core/Application';

export default class UsersController {
  async login({auth, request, response, session}: HttpContextContract){
    try {
      const { pseudo, password }: {pseudo: string, password: string} = request.only(['pseudo', 'password']);

      await auth.attempt(pseudo, password, true);
      return response.redirect(`/me/${pseudo}`)
        
    } catch (error) {
      session.flash('loginError', 'Adressse mail ou nom d\'utilisateur incorrect');
      response.redirect().back()
    }
  }

  async save(pseudo: string, password: string, picture: boolean){
    try {
      const user = await User.create({
        password,
        pseudo,
        picture,
      })

      return user;
    } catch (error) {
      return
    }
  }

  async register({auth, request, response, session}: HttpContextContract){
    const {pseudo, password }: {pseudo: string, password: string} = request.only(['pseudo', 'password']);
    try {
      
      const file = request.file('picture', {
        size: '2mb',
        extnames: ['jpg', 'png', 'jpeg'], 
      });

      if(file){
        const user = await this.save(pseudo, password, true);
        if (user) {
          await file.move(Application.tmpPath('uploads'), {
            name: user.id.toString()+'.'+file.extname,
            overwrite: true
          })

          await auth.login(user, true);
          return response.redirect(`/me/${user.pseudo}`)
        }else{
          session.flash('register', "Pseudo déja utiliser")
          return response.redirect().back()
        }
        
      }else{
        const user = await this.save(pseudo, password, false);
        if (user) {
          await auth.login(user, true);
          return response.redirect(`/me/${user.pseudo}`)
        }else{
          session.flash('register', "Pseudo déja utiliser")
          response.redirect().back()
        }
      }
      

    } catch (error) {
      session.flash('register', "Pseudo déja utiliser")
      return response.redirect().back()
    }
  }

  async logout({auth, response}: HttpContextContract){
    await auth.logout();
    response.redirect('/login')
  }

  async messagepage({ request, view }: HttpContextContract){
    const pseudo = request.param('pseudo');

    const user = await User.findBy('pseudo', pseudo);

    if(user){
      console.log(user)
      return view.render('page/form', {pseudo: user.pseudo})
    }else{
      return await view.render('errors/not-found-user', { pseudo })
    }
  }


}
