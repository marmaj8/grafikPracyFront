<template>
  <div class="q-pa-md">
    <div class="q-gutter-md row items-start">
      <q-input name="txtNameFiltr"
        filled
        v-model="szukaj.nazwa"
        label="Filtruj Stanowiska"
      />
    </div>
    <div class="row">
      <q-table name="tabPositions"
        class="col-12"
        :data="filtrujStanowiska"
        :columns="columns"
        row-key="Id"
        @row-click="rowclick"
        :pagination.sync="pagination"
        
        virtual-scroll
        :virtual-scroll-sticky-size-start="0"
      />
    </div>
      <q-btn name="btnAdd" color="secondary" label="Dodaj" @click="dodaj" />
  </div>
</template>

<script>
export default {
  name: "PageLogin",
  data() {
    return {
        stanowiska: [],
        szukaj: {
          nazwa: ''
        },
        columns: [
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
    filtrujStanowiska: function() {
      return this.stanowiska.filter(
        p => p.Nazwa.includes(this.szukaj.nazwa))
    }
  },
  methods: {
    rowclick(vt, row) {
      this.$router.push("/stanowisko?id=" + row.Id);
    },
    dodaj () {
      this.$router.push("/stanowisko");
    },
    wczytajDane() {
      this.$axios
        .get("api/stanowisko/list", {
          headers: {
            Authorization:
              this.$q.sessionStorage.getItem("token_type") +
              " " +
              this.$q.sessionStorage.getItem("access_token")
          }
        })
        .then(response => {
          this.stanowiska = response.data;
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
            this.wyloguj()
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
