<template>
  <q-page class="q-pa-md" v-if="pracownik">
    <div class="row flex flex-center">
        <q-btn class="half-width" color="secondary" label="Zapisz" @click="zmien" />
    </div>
    <div class="row flex flex-center">
      <q-item>
        <q-list class="bg-white" separator bordered>
        <q-item>
          <q-item-section>Imie</q-item-section>
          <q-input filled v-model="pracownik.Imie" />
        </q-item>
        <q-item>
          <q-item-section>Nazwisko</q-item-section>
          <q-input filled v-model="pracownik.Nazwisko" />
        </q-item>
        <q-item>
          <q-item-section>Email</q-item-section>
          <q-input type="email" filled v-model="pracownik.Imie" />
        </q-item>
        <q-item>
          <q-item-section>Ilość godzin w umowie</q-item-section>
          <q-input filled v-model="pracownik.GodzinWUmowie" mask="###" unmasked-value />
        </q-item>
        <q-item>
          <q-item-section>Uprawnienia Administratora</q-item-section>
          <q-checkbox v-model="pracownik.Administrator" />
        </q-item>

        <q-item>
          <q-item-section>Hasło</q-item-section>
          <q-input v-model="pracownik.Haslo" filled :type="isPwd ? 'password' : 'text'">
            <template v-slot:append>
              <q-icon
                :name="isPwd ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="isPwd = !isPwd"
              />
            </template>
          </q-input>
        </q-item>
        </q-list>
      </q-item>
      <q-item>

      <q-list class="bg-white" separator bordered>
        <q-item-label header>Możliwe godziny pracy</q-item-label>
        <q-item v-for="(dzien ) in dni" :key="dzien.nazwa">
          <q-item-section>
          <q-item-label>{{dzien.nazwa}}</q-item-label>
              <div class="row items-center" >
              <q-checkbox class="row" v-model="dzien.aktywny"/>
                <q-input v-if="dzien.aktywny" label="od" v-model="dzien.poczatek" filled type="time"/>
                <q-input v-if="dzien.aktywny" label="do" v-model="dzien.koniec" filled type="time"/>
              </div>
          </q-item-section>
        </q-item>
      </q-list>
      </q-item>
      <q-item>
      <q-table
      title="Stanowiska"
      :data="stanowiska"
      :columns="stanowiskaColumns"
      row-key="Id"
      selection="multiple"
      :selected.sync="wybraneStanowiska"
      :pagination.sync="pagination"
    />
      </q-item>

    </div>
  </q-page>
</template>

<script>
export default {
  name: "PagePracownik",
  data() {
    return {
      pracownik: null,
      stanowiska: [],
      wybraneStanowiska: [],
      stanowiskaColumns: [
        {
          name: "Id",
          required: true,
          label: "Nr",
          align: "left",
          field: "Id",
          sortable: true
        },
        {
          name: "Nazwa",
          required: true,
          label: "Nazwa",
          align: "left",
          field: "Nazwa",
          sortable: true
        },
      ],
      pagination: {
        sortBy: 'desc',
        descending: false,
        page: 1,
        rowsPerPage: 10
      },
      dni: [
        { id: 0, nazwa: "niedziela", aktywny: false, poczatek: "08:00", koniec: "20:00" },
        { id: 1, nazwa: "poniedziałek", aktywny: false, poczatek: "08:00", koniec: "20:00"  },
        { id: 2, nazwa: "wtorek", aktywny: false, poczatek: "08:00", koniec: "20:00"  },
        { id: 3, nazwa: "środa", aktywny: false, poczatek: "08:00", koniec: "20:00"  },
        { id: 4, nazwa: "czwartek", aktywny: false, poczatek: "08:00", koniec: "20:00"  },
        { id: 5, nazwa: "piątek", aktywny: false, poczatek: "08:00", koniec: "20:00"  },
        { id: 6, nazwa: "sobota", aktywny: false, poczatek: "08:00", koniec: "20:00"  }
      ],
      isPwd: true
    };
  },
  computed: {
  },
  methods: {
    wczytajDane() {
      this.$axios
        .get("api/pracownik/get/" + this.$route.query.id, {
          headers: {
            Authorization:
              this.$q.sessionStorage.getItem("token_type") +
              " " +
              this.$q.sessionStorage.getItem("access_token")
          }
        })
        .then(response => {
          var data = response.data;

          this.$axios
            .get(
              "api/Stanowisko/List/",
              {
                headers: {
                  Authorization:
                    this.$q.sessionStorage.getItem("token_type") +
                    " " +
                    this.$q.sessionStorage.getItem("access_token")
                }
              }
            )
            .then(response => {
              this.stanowiska = response.data;

              this.stanowiska = [];
              this.wybraneStanowiska = [];
              response.data.forEach(st => {
                  var stanowisko = {
                    Id: st.Id,
                    Nazwa: st.Nazwa
                  }
                data.Stanowiska.forEach(stPrac => {
                  if (st.Id == stPrac.StanowiskoId)
                  {
                    this.wybraneStanowiska.push(stanowisko)
                  }
                })
                this.stanowiska.push(stanowisko)
              })

              console.log(data)

              data.DniRobocze.forEach(item => {
                  this.dni[item.dzien].poczatek = item.poczatek.split("T")[1].substr(0,5)
                  this.dni[item.dzien].koniec = item.koniec.split("T")[1].substr(0,5)
                  this.dni[item.dzien].aktywny = true
              });
              this.pracownik = data;
            })
            .catch(error => {
              throw error;
            });

          this.pracownik = data;
        })
        .catch(error => {
          if (error.response == null) {
            this.$q.notify({
              color: "negative",
              position: "center",
              message: "Brak połączenia z serwerem!",
              icon: "report_problem"
            });
          } else if (error.response.status == 401) {
            this.$q.sessionStorage.remove("uzytkownik_id");
            this.$q.sessionStorage.remove("uzytkownik_nazwa");
            this.$q.sessionStorage.remove("uzytkownik_admin");
            //this.$q.sessionStorage.remove('uzytkownik')
            this.$q.sessionStorage.remove("access_token");
            this.$q.sessionStorage.remove("token_type");

            this.$router.push("/login");
          } else {
            this.$q.notify({
              color: "negative",
              position: "center",
              message: error.response.data.Message,
              icon: "report_problem"
            });
          }
        });
    },
    zmien() {
        this.pracownik.DniRobocze = []

        this.dni.forEach(item => {
            if(item.aktywny == true)
            {
                var poczatek = "1900-01-01T" + item.poczatek + ":00"
                var koniec = "1900-01-01T" + item.koniec + ":00"
                this.pracownik.DniRobocze.push( { dzien: item.id, pracownik: this.pracownik.Id, poczatek: poczatek, koniec: koniec} )
            }
        });
        
        if (this.pracownik.Haslo != null && this.pracownik.Haslo.length == 0)
        {
            this.pracownik.Haslo = null
        }

        this.pracownik.Stanowiska = [];
        this.wybraneStanowiska.forEach(st => {
          this.pracownik.Stanowiska.push( {StanowiskoId: st.Id})
        })
        

      this.$axios
        .patch("api/pracownik/patch", this.pracownik, {
          headers: {
            Authorization:
              this.$q.sessionStorage.getItem("token_type") +
              " " +
              this.$q.sessionStorage.getItem("access_token"),
            "Content-Type": "application/json"
          }
        })
        .then(response => {
          this.$q.notify({
            color: "positive",
            position: "center",
            message: "Zmieniono",
          });
        })
        .catch(error => {
          if (error.response == null) {
            this.$q.notify({
              color: "negative",
              position: "center",
              message: "Brak połączenia z serwerem!",
              icon: "report_problem"
            });
          } else if (error.response.status == 401) {
            this.$q.sessionStorage.remove("uzytkownik_id");
            this.$q.sessionStorage.remove("uzytkownik_nazwa");
            this.$q.sessionStorage.remove("uzytkownik_admin");
            //this.$q.sessionStorage.remove('uzytkownik')
            this.$q.sessionStorage.remove("access_token");
            this.$q.sessionStorage.remove("token_type");

            this.$router.push("/login");
          } else {
            this.$q.notify({
              color: "negative",
              position: "center",
              message: error.response.data,
              icon: "report_problem"
            });
          }
        });
    }
  },
  created() {
    this.wczytajDane();
  }
};
</script>

<style>
  .q-table__title {
    color:#757575;
    padding: 16px;
    font-size: .875rem;
    letter-spacing: .01786em;
    line-height: 1.2em !important;
  }
  .half-width {
    width: 50%;
  }
</style>