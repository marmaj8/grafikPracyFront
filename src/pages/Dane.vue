<template>
  <q-page class="flex flex-center">

      <div v-if="pracownik != null">
        <q-list class="bg-white" separator bordered>
          <q-item-label header>Dane</q-item-label>
          <q-item>
            <q-item-section >Imie</q-item-section >
            <q-item-section >{{pracownik.Imie}}</q-item-section >
          </q-item>
          <q-item>
            <q-item-section >Nazwisko</q-item-section >
            <q-item-section >{{pracownik.Nazwisko}}</q-item-section >
          </q-item>
          <q-item>
            <q-item-section >Nr</q-item-section >
            <q-item-section >{{pracownik.Id}}</q-item-section >
          </q-item>
          <q-item>
            <q-item-section >Email</q-item-section >
            <q-item-section >{{pracownik.Email}}</q-item-section >
          </q-item>
          <q-item>
            <q-item-section >GodzinWUmowie</q-item-section >
            <q-item-section >{{pracownik.GodzinWUmowie}}</q-item-section >
          </q-item>
          <q-item v-if="pracownik.Administrator == true">
            <q-item-section >Posiada Uprawnienia Administratora</q-item-section >
          </q-item>

          <q-item class="items-center">
              <q-item-section >Hasło</q-item-section >
              <q-item-section >
                  <q-input v-model="pracownik.Haslo" filled :type="isPwd ? 'password' : 'text'">
                    <template v-slot:append>
                    <q-icon
                        :name="isPwd ? 'visibility_off' : 'visibility'"
                        class="cursor-pointer"
                        @click="isPwd = !isPwd"
                    />
                    </template>
                </q-input>
              </q-item-section >
              <q-btn color="secondary" label="Zmień Hasło" @click="zmien" />
          </q-item>
        </q-list>

          <q-list class="bg-white" separator bordered>
              <q-item-label header>Możliwe godziny pracy</q-item-label>
              <q-item  v-for="(dzien) in dniRobocze" :key="dzien.dzien">
                <q-item-section>
                  <div class="row">
                    <div class="col">
                      {{nazwyDni[dzien.dzien].nazwa}}
                    </div>
                    <div class="col">
                      {{dzien.poczatek.split("T")[1].split(":")[0]}}:{{dzien.poczatek.split("T")[1].split(":")[1]}}
                      -
                      {{dzien.koniec.split("T")[1].split(":")[0]}}:{{dzien.koniec.split("T")[1].split(":")[1]}}
                    </div>
                  </div>
                  
                  
                </q-item-section>
              </q-item>
          </q-list>
      </div>
  </q-page>
</template>

<script>

export default {
  name: 'PageLogin',
  data () {
    return {
        pracownik: null,
        dniRobocze: [],
        nazwyDni: [
            { nazwa: "niedziela" },
            { nazwa: "poniedziałek" },
            { nazwa: "wtorek" },
            { nazwa: "środa" },
            { nazwa: "czwartek" },
            { nazwa: "piątek" },
            { nazwa: "sobota" }
        ],
        isPwd: true
    }
  },

  methods: {
    wczytajDane () {
        this.$axios.get('api/pracownik/get', {
            headers: { Authorization: this.$q.sessionStorage.getItem('token_type') + " " + this.$q.sessionStorage.getItem('access_token') }
        })
        .then((response) => {

            var data = response.data

            this.$axios.get('api/DzienRoboczy/List/' + this.$q.sessionStorage.getItem('uzytkownik_id'), {
                headers: { Authorization: this.$q.sessionStorage.getItem('token_type') + " " + this.$q.sessionStorage.getItem('access_token') }
            })
            .then((response) => {
                this.dniRobocze = response.data
                this.pracownik = data;
            })
            .catch((error) => {
                throw error
            })

            this.pracownik = response.data
        })
        .catch((error) => {
            if (error.response == null)
            {
              this.$q.notify({
                color: 'negative',
                position: 'center',
                message: 'Brak połączenia z serwerem!',
                icon: 'report_problem'
              })
            }
            else if (error.response.status == 401) {
                this.wyloguj();
            }
            else
            {
              this.$q.notify({
                color: 'negative',
                position: 'center',
                message: error.response.data.Message,
                icon: 'report_problem'
              })
            }
        })
    },
    zmien () {
        if (this.pracownik.Haslo.length == 0)
        {
              this.$q.notify({
                color: 'negative',
                position: 'center',
                message: 'Proszę wprowadzić hasło!',
                icon: 'report_problem'
              })
              return
        }
        
        
        let body = new URLSearchParams()
        body.set('pracownik', this.pracownik)

        this.$axios.patch('api/pracownik/patch', this.pracownik, {
            headers: { 
                Authorization: this.$q.sessionStorage.getItem('token_type') + " " + this.$q.sessionStorage.getItem('access_token')
                ,'Content-Type': 'application/json' },
            
        })
        .then((response) => {
              this.$q.notify({
                color: 'negative',
                position: 'center',
                message: 'Zmieniono Hasło',
                icon: 'report_problem'
              })
        })
        .catch((error) => {
            if (error.response == null)
            {
              this.$q.notify({
                color: 'negative',
                position: 'center',
                message: 'Brak połączenia z serwerem!',
                icon: 'report_problem'
              })
            }
            else if (error.response.status == 401) {
              this.wyloguj()
            }
            else
            {
              this.$q.notify({
                color: 'negative',
                position: 'center',
                message: error.response.data,
                icon: 'report_problem'
              })
            }
        })
    },
    wyloguj()
    {
      this.$q.sessionStorage.remove('uzytkownik_id')
      this.$q.sessionStorage.remove('uzytkownik_nazwa')
      this.$q.sessionStorage.remove('uzytkownik_admin')
      //this.$q.sessionStorage.remove('uzytkownik')
      this.$q.sessionStorage.remove('access_token')
      this.$q.sessionStorage.remove('token_type')
      localStorage.clear()
      this.$router.push("/login")
    }
  },
  created () {
    this.wczytajDane()
  }
}
</script>
