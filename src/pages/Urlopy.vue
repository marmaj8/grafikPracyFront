<template>
  <q-page class="flex flex-center">
  <div class="q-pa-md">
    <div class="q-gutter-md row items-start">
      <q-input v-model="data" filled type="date" hint="Początek" @change="wczytajDane" />
      <q-checkbox v-model="filtr.tylkoZatwierdozne" label="Tylko Zatwierdozne" color="teal" />
      <q-checkbox v-model="filtr.tylkoMoje" label="Tylko Moje" color="teal" />
    </div>
    <div class="row">
      <q-table class="col-12"
        :data="filtrowanieUrlopow"
        :columns="columns"
        row-key="Id"
        @row-click="rowclick"
        :pagination.sync="pagination"
      />
    </div>

    <div class="q-gutter-md row items-start ">
      <q-item class="items-center">
        <q-input class="col-3" v-model="urlop.poczatek" filled type="date" hint="Początek" />
        <q-input class="col-3" v-model="urlop.koniec" filled type="date" hint="Koniec" />
        <q-input class="col-3" v-model="urlop.powod" filled hint="Powód" />
        <q-btn class="col-3" color="secondary" label="Zgłoś" @click="dodaj" />
      </q-item>
    </div>

    <q-dialog v-model="confirm.confirm" persistent>
      <q-card>
        <q-card-section class="row items-center">
          <q-avatar icon="signal_wifi_off" color="primary" text-color="white" />
          <span class="q-ml-sm">{{confirmTxt()}}</span>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Anuluj" color="primary" v-close-popup />
          <q-btn flat label="Zatwierdź" color="primary" @click="zatwierdx" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
  </q-page>
</template>

<script>
export default {
  name: "PageLogin",
  data() {
    return {
      urlop: {
        poczatek: "",
        koniec: "",
        pracownik: "",
        powod: "",
      },
      filtr: {
        tylkoZatwierdozne: false,
        tylkoMoje: false,
      },
      pracownicy: [],
        urlopy: [],
        columns: [
        {
          name: "Id",
          align: "center",
          label: "Nr",
          field: "id"
        },
        {
          name: "Osoba",
          align: "center",
          label: "Osoba",
          field: "pracownik",
          format: (val, row) => {
            if (this.tylkoMoje) { return this.$q.sessionStorage.getItem('uzytkownik_nazwa')}
            else { var pp = this.pracownicy.find(p => p.Id == val)
              if (pp == null) { return ""}
              return pp.Imie + " " + pp.Nazwisko
            }
          },
          sortable: true
        },
        {
          name: "Poczatek",
          align: "center",
          label: "Poczatek",
          field: "poczatek",
          sortable: true,
          format: (val, row) => `${val.split("T")[0].split("-")[2]}.${val.split("T")[0].split("-")[1]}.${val.split("T")[0].split("-")[0]}`
        },
        {
          name: "Koniec",
          align: "center",
          label: "Koniec",
          field: "koniec",
          sortable: true,
          format: (val, row) => `${val.split("T")[0].split("-")[2]}.${val.split("T")[0].split("-")[1]}.${val.split("T")[0].split("-")[0]}`

        },
        {
          name: "Powod",
          align: "center",
          label: "Powod",
          field: "powod"
        },
        {
          name: "Zatwierdzony",
          align: "center",
          label: "Zatwierdzony",
          field: "zatwierdzony",
          sortable: false,
          format: (val, row) => {
            if (val == true) {
              return "TAK"
            }
              else return "NIE"
            }
        },
      ],
      pagination: {
        sortBy: 'Id',
        descending: true,
        page: 1,
        rowsPerPage: 10
      },
      confirm: {
        value: "",
        confirm: false,
      },
      data: ""
    };
  },
  computed: {
      filtrowanieUrlopow: function() {
        return this.urlopy.filter( u => {
          if (this.filtr.tylkoZatwierdozne && u.zatwierdzony == false) { return false}
          else { return true}
        }).filter( u => {
          if (this.filtr.tylkoMoje && u.pracownik != this.urlop.pracownik) { return false}
          else { return true}
        })
      }
  },
  methods: {
    confirmTxt() {
      var txt = "";
      if (this.confirm.confirm == true)
      {
        var pracownik = this.pracownicy.find(p => p.Id == this.confirm.value.pracownik);
        var data = this.confirm.value.poczatek.split("T")[0];
        txt = "Czy zatwierdzasz urlop " + pracownik.Imie + " " + pracownik.Nazwisko;
        txt += " w okresie od " + data.split("-")[2] + "-" + data.split("-")[1] + "-" + data.split("-")[0];
        data = this.confirm.value.koniec.split("T")[0];
        txt += " do " + data.split("-")[2] + "-" + data.split("-")[1] + "-" + data.split("-")[0];
        txt += "?"
      }
      return txt;
    },
    zatwierdx() {
      this.$axios.patch('api/urlop/zatwierdz?id=' + this.confirm.value.id, null, {
        headers: {
            Authorization:
              this.$q.sessionStorage.getItem("token_type") +
              " " +
              this.$q.sessionStorage.getItem("access_token")
          }
      })
        .then((response) => {
            this.urlopy.find(u => u.id == response.data).zatwierdzony = true;
            
              this.$q.notify({
                color: 'positive',
                position: 'center',
                message: 'Zatwierdzono urlop nr ' + response.data,
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
                this.wyloguj();
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

      this.confirm.confirm = false;
      this.confirm.value = "";
    },
    rowclick(vt, row) {
      this.confirm.value = row;
      this.confirm.confirm = true;
      //if (this.$q.sessionStorage.getItem("uzytkownik_admin") == true) { this.$router.push("/urlop?id=" + row.id); }
    },
    dodaj () {
        this.$axios.put('api/urlop/put',this.urlop, {
          headers: {
            Authorization:
              this.$q.sessionStorage.getItem("token_type") +
              " " +
              this.$q.sessionStorage.getItem("access_token")
          }
        })
        .then((response) => {
            this.urlop.id = response.data;
            this.urlop.zatwierdzony = true;

            this.urlopy.push( {
              id: this.urlop.id,
              poczatek: this.urlop.poczatek,
              koniec: this.urlop.koniec,
              pracownik: this.urlop.pracownik,
              powod: this.urlop.powod,
              zatwierdzony: this.urlop.zatwierdzony
            })
              this.$q.notify({
                color: 'positive',
                position: 'center',
                message: 'Zgłoszono Urlop',
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
                this.wyloguj();
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
    wczytajDaneW() {
      this.$axios
        .get("api/urlop/list?data=" + this.data + "&zatwierdzone=false",{
          headers: {
            Authorization:
              this.$q.sessionStorage.getItem("token_type") +
              " " +
              this.$q.sessionStorage.getItem("access_token")
          }
        })
        .then(response => {
          this.urlopy = response.data;
          
          this.$axios.get("api/urlop/list?data=" + this.data + "&zatwierdzone=false",{
            headers: {
              Authorization:
                this.$q.sessionStorage.getItem("token_type") +
                " " +
                this.$q.sessionStorage.getItem("access_token")
            }
          })
          .then(response => {
            this.urlopy = response.data;

            this.$axios.get("api/pracownik/list", {
            headers: {
              Authorization:
                this.$q.sessionStorage.getItem("token_type") +
                " " +
                this.$q.sessionStorage.getItem("access_token")}
            })
            .then(response => {
              this.pracownicy = response.data;
            })
            .catch(error => {
              throw error
            })

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
              this.wyloguj();
            } else {
              this.$q.notify({
                color: "negative",
                position: "center",
                message: error.response.data.Message,
                icon: "report_problem"
              });
            }
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
            this.wyloguj();
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
    wczytajDaneM() {
      this.$axios
        .get("api/urlop/list?data=" + this.data + "&zatwierdzone=false",{
          headers: {
            Authorization:
              this.$q.sessionStorage.getItem("token_type") +
              " " +
              this.$q.sessionStorage.getItem("access_token")
          }
        })
        .then(response => {
          this.urlopy = response.data;
          
          this.$axios.get("api/urlop/list?data=" + this.data + "&zatwierdzone=false",{
            headers: {
              Authorization:
                this.$q.sessionStorage.getItem("token_type") +
                " " +
                this.$q.sessionStorage.getItem("access_token")
            }
          })
          .then(response => {
            this.urlopy = response.data;
          })
          .catch(error => {
            throw error;
          })
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
            wyloguj();
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
    wczytajDane() {
      if (this.$q.sessionStorage.getItem("uzytkownik_admin") == true) { this.wczytajDaneW() }
      else { this.wczytajDaneM()}
    },
    wyloguj: function () {
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
  created() {
      var data = new Date();
      var dd = data.getDate();
      var mm = data.getMonth() + 1;
      var yy = data.getFullYear();
      this.data = yy + "-";
      if (mm < 10) { this.data += "0" + mm + "-"}
      else { this.data +=  mm + "-"}
      if (dd < 10) { this.data += "0" + dd}
      else { this.data +=  dd}

      //this.data = "2020-01-01"
      this.urlop.pracownik = this.$q.sessionStorage.getItem("uzytkownik_id");
    this.wczytajDane();
  }
};
</script>
