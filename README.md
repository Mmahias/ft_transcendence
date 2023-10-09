# ft_transcendence
##### Léo: 29/09
Tous nos problèmes de buils venaient de notre config docker.

* Déja, on chargeait le ```.env``` dans notre back au lieu de ```backend/.env```
Du coup on avait beau modifier comme on voulait le ```backend/.env``` ca ne faisait rien.

* En plus de ça, les reseaux etaient mal configurés, la db et le back n'etaient pas sur le meme reseau.

* Petit tips qui ma fait tilté, quand tu essaye d'acceder à <http://localhost:xxx> depuis ta machine locale, ok, ca test le port xxx de ta machine locale
Mais quand tu fais la même dans un container, ca test le port xxx du container, pas de ta machine locale...

* Enfin, comme nos containers sont sur le même réseau ils peuvent communiquer chacun les uns avec les autres. Pour bien le voir:

  ```bash
  docker network inspect ft_transcendence_ft_network | grep -E 'Subnet|Name|IPv4Address'```
* J'ai installé ping et psql dans le container back pour pouvoir tester la connection avec la db et les autres containers. En +, docker est bien fait, si vous voulez ping un autre container sur le même réseau, vous pouvez juste le mentionner par son nom. (```ping postgres``` ou ```ping front```)

**Le truc qui ma tout fait tilté**, je me suis connecté au container back et j'ai fait tous mes tests dedans, ce que j'aurais du faire dès le début mais j'avais pas réalisé. 

``` bash

docker exec -it back bash
```

Maintenant, tout tourne chez moi

TRUCS:

* pour avoir accès aux logs d'un container en direct:
  ```docker logs -f <container_name>```

##### Léo: 01/10

* I added a shared folder which is actually a shared package.
To use it, just add some types or shared data you may need.

* To reference it in front or back, you import thet type with  ```import { type } from @ft-transcendence/my_file```

* The package.json in it makes it a package and i actually installed it in front and back like any other package with ```npm install ../shared```. It created a symbolic link to the shared folder, so any change youll make in it will be reflected in front and back without having to re-install it.

##### Léo: 02/10

###### TO FIX

*GENERAL:*

* quand on recherche des utilisateurs la fenetre de dropdown est degueulasse
-- FIXED
* quand on clique sur un user dans la dropdown, ca nous redirige vers la page profile de lutilisateur mais ca ne ferme pas la dropdown
-- FIXED
* faire une homepage pour quand on se login (sobre)

*USER:*

* Le bouton d'edit sur la page profile renvoie sur une page edit qui sert a rien. Mieux vaut creer un modal pour editer le profil ou mettre un state editProfile set a false de base et qui passe a true quand on clique sur le bouton edit pour donner acces a un display d'edit.
* faire passer lutilisateur offline quand il se deconnecte (via socket)
* faire passer lutilisateur online quand il se connecte (via socket)
* si le user se conencte sur 2 sessions, le deconnecter de lautre ?
* imaginer + implementer des achievemnts pour les users (model achievement deja cree en bdd)

*GAME:*

* foutre les sockets
* faire un systeme de rooms pour les games (via socket)
* refaire le jeu avec phaser ?
* faire un systeme de classement elo
* reperer les achievements quand ils sont debloques
* garder un historique des games
* mettre des features de chat dans les games
