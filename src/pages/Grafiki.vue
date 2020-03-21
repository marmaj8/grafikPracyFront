<template>
  <q-page class="flex flex-center">
  <div class="q-pa-md">
    <div class="q-gutter-md row items-start">
      <q-input v-model="filtr.poczatek" filled type="date" hint="Pocątek" />
      <q-input v-model="filtr.koniec" filled type="date" hint="Koniec" />
      <q-checkbox v-model="filtr.tylkoZatwierdozne" label="Tylko Zatwierdozne" color="teal" />
    </div>
    <div class="row">
      <q-table class="col-12"
        :data="filtrowanieGrafiow"
        :columns="columns"
        row-key="Id"
        @row-click="rowclick"
        :pagination.sync="pagination"
      />
    </div>

    <div class="q-gutter-md row items-start ">
      <q-item  class="items-center">
        <q-input v-model="poczatek" filled type="date" hint="Pocątek" :disable="generowany" />
        <q-input v-model="koniec" filled type="date" hint="Koniec" :disable="generowany" />
        <q-input
          v-model.number="dlugosc" type="number" filled hint="Przedziałów na Godzinę" :disable="generowany" />
        <q-btn v-if="!generowany" color="secondary" label="Wygeneruj Grafik" @click="dodaj" />
        <q-btn v-else color="secondary" disable label="Trwa Generowanie" />
      </q-item>
    </div>
  </div>
  </q-page>
</template>

<script>
export default {
  name: "PageLogin",
  data() {
    return {
      generowany: false,
      poczatek: "",
      koniec: "",
      dlugosc: 1,
      filtr: {
        poczatek: "",
        koniec: "",
        tylkoZatwierdozne: true
      },
        pracownik: {
            Imie: "",
            Nazwisko: "",
            Haslo: "",
            Email: "",
            GodzinWUmowie: "",
            Administrator: false
        },
        szukaj: {
          imie: '',
          nazwisko: ''
        },
        grafiki: [],
        columns: [
        {
          name: "Id",
          align: "center",
          label: "Nr",
          field: "Id",
          sortable: true
        },
        {
          name: "Poczatek",
          align: "center",
          label: "Poczatek",
          field: "Poczatek",
          sortable: true,
          format: (val, row) => `${val.split("T")[0].split("-")[2]}.${val.split("T")[0].split("-")[1]}.${val.split("T")[0].split("-")[0]}`
        },
        {
          name: "Koniec",
          align: "center",
          label: "Koniec",
          field: "Koniec",
          sortable: true,
          format: (val, row) => `${val.split("T")[0].split("-")[2]}.${val.split("T")[0].split("-")[1]}.${val.split("T")[0].split("-")[0]}`

        },
        {
          name: "Zatwierdzony",
          align: "center",
          label: "Zatwierdzony",
          field: "Zatwierdzony",
          sortable: false,
          format: (val, row) => {
            if (val != null) {
              var data = val.split("T")[0];
              var godzina = val.split("T")[1].split(".")[0];
              return data.split("-")[2] + "." + data.split("-")[1] + "." + data.split("-")[0] + " " + godzina;
            }
            else return "NIE"
            }
        }
      ],
      pagination: {
        sortBy: 'Id',
        descending: true,
        page: 1,
        rowsPerPage: 10
      },
    };
  },
  computed: {
    filtrowanieGrafiow: function() {
      var grafiki = this.grafiki;
      if (this.filtr.poczatek != "" )
      {
        var date = this.filtr.poczatek.split("T")[0];
        var pp = new Date(date.split("-")[0], date.split("-")[1], date.split("-")[2]);

        grafiki = grafiki.filter(g => {
          date = g.Poczatek.split("T")[0];
          var gp = new Date(date.split("-")[0], date.split("-")[1], date.split("-")[2]);
          date = g.Koniec.split("T")[0];
          var gk = new Date(date.split("-")[0], date.split("-")[1], date.split("-")[2]);

          if (gk >= pp) return true;
          else return false;
        })
      }
      if (this.filtr.koniec != "")
      {
        var date = this.filtr.koniec.split("T")[0];
        var kk = new Date(date.split("-")[0], date.split("-")[1], date.split("-")[2]);

        grafiki = grafiki.filter(g => {
          var date = g.Poczatek.split("T")[0];
          var gp = new Date(date.split("-")[0], date.split("-")[1], date.split("-")[2]);
          date = g.Koniec.split("T")[0];
          var gk = new Date(date.split("-")[0], date.split("-")[1], date.split("-")[2]);

          if (gp <= kk) return true;
          else return false;
        })
      }
      if (this.filtr.tylkoZatwierdozne)
      {
        grafiki = grafiki.filter(g => g.Zatwierdzony != null)
      }
      return grafiki;
    }
  },
  methods: {
    rowclick(vt, row) {
      this.$router.push("/grafik?id=" + row.Id);
    },
    dodaj () {
        if (this.poczatek == "" || this.koniec == "")
        {
              this.$q.notify({
                color: 'negative',
                position: 'center',
                message: 'Wprowadzone niewłaściwie granice!',
                icon: 'report_problem'
              })
          return;
        }
        this.generowany = true;
        this.$axios.post('api/grafik/Generuj?poczatek='+this.poczatek+'&koniec='+this.koniec+'&naGodzine='+this.dlugosc,null, {
          timeout: 0,
          headers: {
            Authorization:
              this.$q.sessionStorage.getItem("token_type") +
              " " +
              this.$q.sessionStorage.getItem("access_token")
          }
        })
        .then((response) => {
            this.grafiki.push( {
              Id: response.data,
              Poczatek: this.poczatek,
              Koniec: this.koniec,
              Zatwierdzony: null,
            } )
            this.pracownik.Id = response.data
              this.$q.notify({
                color: 'positive',
                position: 'center',
                message: 'Dodano Pracownika',
                icon: 'report_problem'
              })
              this.generowany = false;
        })
        .catch((error) => {
            console.log(error)
            if (error.response.status == 409)
            {
              this.generowany = true
              this.$q.notify({
                color: 'negative',
                position: 'center',
                message: 'Trwa inne generowanie!',
                icon: 'report_problem'
              })
            }
            else if (error.response == null)
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
            this.generowany = false;
        })
    },
    wczytajDane() {
      this.$axios
        .get("api/grafik/list?czyWszystkie=true",{
          headers: {
            Authorization:
              this.$q.sessionStorage.getItem("token_type") +
              " " +
              this.$q.sessionStorage.getItem("access_token")
          }
        })
        .then(response => {
          this.grafiki = response.data;

          this.$axios
            .get("api/grafik/CzyGeneruje",{
          headers: {
            Authorization:
              this.$q.sessionStorage.getItem("token_type") +
              " " +
              this.$q.sessionStorage.getItem("access_token")
          }
          })
          .then(response => {
            this.generowany = response.data
          })
          .catch(error => {
            
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
    this.wczytajDane();
  }
};
</script>
