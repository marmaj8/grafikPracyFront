<template>
  <q-page class="flex flex-center">

      <div>
        <q-list class="bg-white" separator bordered>
              <q-item-label header>Stanowisko {{stanowisko.Id}}</q-item-label>
        <q-item>
          <q-item-section>Nazwa</q-item-section>
          <q-input filled v-model="stanowisko.Nazwa" />
        </q-item>
        <q-item>
          <q-item-section></q-item-section>
            <q-btn v-if="stanowisko.Id!=null" class="col-4" color="positive" label="Zapisz Zmiany" @click="zapisz" />
            <q-btn v-else class="col-4" color="positive" label="Dodaj Stanowisko" @click="dodajStanowisko" />
        </q-item>
        </q-list>

        <q-list class="bg-white" separator bordered>
        <q-item-label header>Wymaganai ilościowe</q-item-label>
        <q-item v-for="(poz) in posortowaneMiejsca" :key="poz.id">
          <q-item-section>
              <div class="row items-center" >
                <q-item-label class="col-2">{{nazwyDni[poz.Dzien].label}}</q-item-label>
                <q-input class="col-2" label="od" v-model="poz.Poczatek" filled type="time"/>
                <q-input class="col-2" label="do" v-model="poz.Koniec" filled type="time"/>
                <q-input class="col-2" label="Minimum" v-model="poz.Min" filled type="number"/>
                <q-input class="col-2" label="Maksimum" v-model="poz.Max" filled type="number"/>
                <q-btn class="col-2" color="negative" label="Usuń" @click="usun(poz.id)" />
              </div>
          </q-item-section>
        </q-item>
        <q-item>
            <q-item-section>
              <div class="row items-center" >
                <q-select class="col-2" v-model="wolne.Dzien" :options="nazwyDni" label="Dzień" />
                <q-input class="col-2" label="od" v-model="wolne.Poczatek" filled type="time"/>
                <q-input class="col-2" label="do" v-model="wolne.Koniec" filled type="time"/>
                <q-input class="col-2" label="Minimum" v-model="wolne.Min" filled type="number"/>
                <q-input class="col-2" label="Maksimum" v-model="wolne.Max" filled type="number"/>
                <q-btn class="col-2" color="positive" label="Dodaj" @click="dodajWymagania" />
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
        stanowisko: {
            Id: null,
            Nazwa: "",
            Miejsca: [],
        },
        miejsca: [],
        miejscaMax: 0,
        dniRobocze: [],
        nazwyDni: [
            { label: "niedziela", value: 0 },
            { label: "poniedziałek", value: 1 },
            { label: "wtorek", value: 2 },
            { label: "środa", value: 3 },
            { label: "czwartek", value: 4 },
            { label: "piątek", value: 5 },
            { label: "sobota", value: 6 }
        ],
        isPwd: true,
        wolne: {
            Dzien: {
                label: null,
                value: null,
            },
            Poczatek: "08:00",
            Koniec: "08:00",
            Min: 0,
            Max: 0,
        },
    }
  },
  computed: {
      posortowaneMiejsca: function() {
          return this.miejsca.sort((a,b) => {
              if(a.Dzien < b.Dzien) { return -1}
              else if (a.Dzien > b.Dzien) {return 1}
              else
              {
                  if (a.Poczatek < b.Poczatek) {return -1}
                  else if (a.Poczatek > b.Poczatek) {return 1}
                  else {return 0}
              }
          })
      }
  },
  methods: {
    dodajStanowisko() {
        var dane = this.stanowisko
        dane.Miejsca = []

        this.miejsca.forEach(m => {
            dane.Miejsca.push( {
                Stanowisko: dane.Id,
                Min: m.Min,
                Max: m.Max,
                Pocatek: m.Poczatek,
                Koniec: m.Koniec,
                Dzien: m.Dzien
            })
        })

        this.$axios.put('api/stanowisko/put/', dane, {
            headers: { Authorization: this.$q.sessionStorage.getItem('token_type') + " " + this.$q.sessionStorage.getItem('access_token') }
        })
        .then((response) => {
              this.$q.notify({
                color: 'positive',
                position: 'center',
                message: 'Dodano Stanowisko',
                icon: 'ok'
              })
              
              this.$router.push("/stanowisko?id=" + response.data)
              this.stanowisko.Id = response.data;
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
                this.$q.sessionStorage.remove('uzytkownik_id')
                this.$q.sessionStorage.remove('uzytkownik_nazwa')
                this.$q.sessionStorage.remove('uzytkownik_admin')
                //this.$q.sessionStorage.remove('uzytkownik')
                this.$q.sessionStorage.remove('access_token')
                this.$q.sessionStorage.remove('token_type')

                this.$router.push("/login")
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
    zapisz() {
        var dane = this.stanowisko
        dane.Miejsca = []

        this.miejsca.forEach(m => {
            dane.Miejsca.push( {
                Stanowisko: dane.Id,
                Min: m.Min,
                Max: m.Max,
                Pocatek: m.Poczatek,
                Koniec: m.Koniec,
                Dzien: m.Dzien
            })
        })

        this.$axios.patch('api/stanowisko/patch/', dane, {
            headers: { Authorization: this.$q.sessionStorage.getItem('token_type') + " " + this.$q.sessionStorage.getItem('access_token') }
        })
        .then((response) => {
              this.$q.notify({
                color: 'positive',
                position: 'center',
                message: 'Zapisano Zmiany',
                icon: 'ok'
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
                this.$q.sessionStorage.remove('uzytkownik_id')
                this.$q.sessionStorage.remove('uzytkownik_nazwa')
                this.$q.sessionStorage.remove('uzytkownik_admin')
                //this.$q.sessionStorage.remove('uzytkownik')
                this.$q.sessionStorage.remove('access_token')
                this.$q.sessionStorage.remove('token_type')

                this.$router.push("/login")
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
    dodajWymagania() {
        if (this.wolne.Dzien == null)
        {
              this.$q.notify({
                color: 'negative',
                position: 'center',
                message: "Należy wybrać dzień!",
                icon: 'report_problem'
              })
            return;
        }

        var wdp = new Date(0,0,0,this.wolne.Poczatek.split(":")[0],this.wolne.Poczatek.split(":")[1]);
        var wdk = new Date(0,0,0,this.wolne.Koniec.split(":")[0],this.wolne.Koniec.split(":")[1]);

        if (wdp >= wdk)
        {
              this.$q.notify({
                color: 'negative',
                position: 'center',
                message: "Wskazano nieprawidłowy przedział!",
                icon: 'report_problem'
              })
            return;
        }

        var test = true;
        this.miejsca.forEach(mm => {
            if (mm.Dzien == this.wolne.Dzien.value)
            {
                var mdp = new Date(0,0,0,mm.Poczatek.split(":")[0],mm.Poczatek.split(":")[1])
                var mdk = new Date(0,0,0,mm.Koniec.split(":")[0],mm.Koniec.split(":")[1])

                if (wdp <= mdp && wdk > mdp || wdp < mdk && wdk >= mdk || wdp >= mdp && wdk <= mdk)
                {
                    this.$q.notify({
                        color: 'negative',
                        position: 'center',
                        message: "Nachodzi na inny przedział!",
                        icon: 'report_problem'
                    })
                    test = false;
                    return;
                }
            }
        })

        if (test)
        {
            this.miejsca.push( {
                    id: this.miejscaMax,
                    Stanowisko: this.stanowisko.Id,
                    Min: this.wolne.Min,
                    Max: this.wolne.Max,
                    Dzien: this.wolne.Dzien.value,
                    Poczatek: this.wolne.Poczatek,
                    Koniec: this.wolne.Koniec,
                })
                this.miejscaMax++;
        }
    },
    usun (id) {
        this.miejsca.splice( this.miejsca.findIndex(m => m.id == id), 1)
    },
    wczytajDane () {
        this.$axios.get('api/stanowisko/get/' + this.$route.query.id, {
            headers: { Authorization: this.$q.sessionStorage.getItem('token_type') + " " + this.$q.sessionStorage.getItem('access_token') }
        })
        .then((response) => {
            this.stanowisko = response.data;

            var i = 0;
            this.stanowisko.Miejsca.forEach(st => {
                var poczatek = st.Pocatek.split("T")[1]
                var koniec = st.Koniec.split("T")[1]
                this.miejsca.push( {
                    id: i,
                    Stanowisko: st.Stanowisko,
                    Min: st.Min,
                    Max: st.Max,
                    Dzien: st.Dzien,
                    Poczatek: poczatek.split(":")[0] + ":" +poczatek.split(":")[1],
                    Koniec: koniec.split(":")[0] + ":" +poczatek.split(":")[1],
                })
                i++;
            });
            this.miejscaMax = i;
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
                this.$q.sessionStorage.remove('uzytkownik_id')
                this.$q.sessionStorage.remove('uzytkownik_nazwa')
                this.$q.sessionStorage.remove('uzytkownik_admin')
                //this.$q.sessionStorage.remove('uzytkownik')
                this.$q.sessionStorage.remove('access_token')
                this.$q.sessionStorage.remove('token_type')

                this.$router.push("/login")
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
        if (this.stanowisko.Haslo.length == 0)
        {
              this.$q.notify({
                color: 'negative',
                position: 'center',
                message: 'Proszę wprowadzić hasło!',
                icon: 'report_problem'
              })
              return
        }

        this.$axios.patch('api/stanowisko/patch', this.stanowisko, {
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
                this.$q.sessionStorage.remove('uzytkownik_id')
                this.$q.sessionStorage.remove('uzytkownik_nazwa')
                this.$q.sessionStorage.remove('uzytkownik_admin')
                //this.$q.sessionStorage.remove('uzytkownik')
                this.$q.sessionStorage.remove('access_token')
                this.$q.sessionStorage.remove('token_type')

                this.$router.push("/login")
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
    }
  },
  created () {
      if (this.$route.query.id != null)
      {
          this.wczytajDane()
      }
  }
}
</script>
