<template>
  <q-page class="flex flex-center">
    <q-input name="txtDate" v-model="data" filled type="date" hint="Data" mask="YYYY.MM.DD" @change="wczytajDane"/>

    <q-list padding v-if="id!=null">
      <q-item-label name="lblScheduleId" header>Grafik nr {{id}}</q-item-label>

      <q-item>
        <q-item-section>
          <q-item-label>Okres</q-item-label>
          <q-item-label name="lblDates">
            {{poczatek.split("-")[2]}}.{{poczatek.split("-")[1]}}.{{poczatek.split("-")[0]}}
            -
            {{koniec.split("-")[2]}}.{{koniec.split("-")[1]}}.{{koniec.split("-")[0]}}
          </q-item-label>
        </q-item-section>
      </q-item>

      <q-item>
        <q-item-section v-if="zatwierdzony!=null">
          <q-item-label >Zatwierdzony</q-item-label>
          <q-item-label name="lblConfirmed">
            {{zatwierdzony}}
          </q-item-label>
        </q-item-section>
        <q-item-section v-else>
          <q-item-label name="lblConfirmed">Wymaga Zatwiedzenia</q-item-label>
          <q-btn name="btnConfirm" color="secondary" label="Zatwierdź" @click="zatwierdz" />
        </q-item-section>
      </q-item>
      <q-item>
        <q-item-section>
          <q-item-label></q-item-label>
          <q-item-label >
                <q-input name="txtDate" v-model="data" filled type="date" hint="Wybierz Dzień" />
          </q-item-label>
        </q-item-section>
      </q-item>
    </q-list>

      <q-item>
        <q-table name="tabSchedule" class="col-12 table-sticky"
        :data="godziny"
        :columns="columns"
        row-key="Godzina"
        virtual-scroll
        hide-bottom
      :pagination.sync="pagination"
      :rows-per-page-options="[0]"
      :virtual-scroll-sticky-size-start="0"
      />
      </q-item>


    
      
  </q-page>
</template>

<script>
/*
      virtual-scroll
      :virtual-scroll-sticky-size-start="48"
      :rows-per-page-options="[0]"
      :pagination.sync="pagination"
*/
export default {
  name: 'PageLogin',
  data () {
    return {
        stanowiska: [],
        poczatek: null,
        koniec: null,
        zatwierdzony: null,
        data: null,
        godziny: [],
        id: null,

        columns: [
          {
            name: "Godzina",
            label: "Godzina",
            align: "center",
            field: row => {
              var poczatek = row.poczatek.split("T")[1]
              var koniec = row.koniec.split("T")[1]
              return poczatek.split(":")[0] + ":" + poczatek.split(":")[1] + " - " + koniec.split(":")[0] + ":" + koniec.split(":")[1]
            },
            sortable: true,
            required: true
          },
          {
            name: "Stanowiska",
            label: "Stanowiska",
            align: "center",
            field: row => {
              var string = ""
              row['stanowiska'].forEach(ss => {
                string += ss + "\n";
              })
              return string
            },
            sortable: false
          }
        ],

        pagination: {
          rowsPerPage: 0,
        }
    }
  },
  methods: {
    przerobNaTabele(dane){
        var popPocz = null;
        var godzina
        dane.forEach(element => {
            if (element.Poczatek != popPocz)
            {
                var stanowiska = [];
                godzina = {
                    poczatek: element.Poczatek,
                    koniec: element.Koniec,
                    stanowiska: stanowiska
                }
                this.godziny.push(godzina)
            }
            console.log(this.stanowiska)
            console.log(element.IdStanowiska)
            var xxx = this.stanowiska.find(st => st.Id == element.IdStanowiska)
            godzina.stanowiska.push( xxx.Nazwa)

            popPocz = godzina.poczatek
        });
    },
    wczytajDane () {
        if (this.data == "" || this.data == null) { this.aktualnaData()}
        this.godziny = [];
        console.log("k " + this.data)
        this.$axios.get('api/grafik/GrafikPracownika?id='+ this.$q.sessionStorage.getItem('uzytkownik_id') + "&dzien=" + this.data , {
            headers: { Authorization: this.$q.sessionStorage.getItem('token_type') + " " + this.$q.sessionStorage.getItem('access_token') }
        })
        .then((response) => {
            if (response.data.Zatwierdzony != null)
            {
              var data = response.data.Zatwierdzony.split("T")[0];
              var godzina = response.data.Zatwierdzony.split("T")[1].split(".")[0];
              this.zatwierdzony = data.split("-")[2] + "." + data.split("-")[1] + "." + data.split("-")[0] + ". " + godzina;
            }

            var naStanowisku = response.data.NaStanowisku;
            naStanowisku = naStanowisku.sort((a,b) => {
                return ((a.Poczatek < b.Poczatek) ? -1 : ((a.Poczatek > b.Poczatek) ? 1 : 0));
            })

              this.$axios.get('api/stanowisko/list/' , {
                  headers: { Authorization: this.$q.sessionStorage.getItem('token_type') + " " + this.$q.sessionStorage.getItem('access_token') }
              })
              .then((response) => {
                this.stanowiska = response.data;

                this.przerobNaTabele(naStanowisku)
              })
              .catch((error) => {
                throw error
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
            else if (error.response.status == 403) {
              this.$q.notify({
                color: 'negative',
                position: 'center',
                message: "Brak Uprawnień!",
                icon: 'report_problem'
              })
              this.$router.push("/")
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
    aktualnaData() {
        var data = new Date();
        var dd = data.getDate();
        var mm = data.getMonth() + 1;
        var yy = data.getFullYear();
        this.data = yy + "-";
        if (mm < 10) { this.data += "0" + mm + "-"}
        else { this.data +=  mm + "-"}
        if (dd < 10) { this.data += "0" + dd}
        else { this.data +=  dd}
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
    },
  },
  created () {
      this.aktualnaData()
      this.wczytajDane()
  }
}
</script>

<style>
.q-table td, .q-table th {
    /* don't shorten cell contents */
    white-space: pre !important;
}
.table-sticky{
  height: 310px;
}
.table-sticky td:first-child{
  background-color: #c1f4cd !important
}
.table-sticky tr th{
  position: sticky;
  z-index: 2;
  background: #fff;
}
.table-sticky thead tr:last-child th{
    top: 48px;
    z-index: 3;
}
.table-sticky thead tr:first-child th{
    top: 0;
    z-index: 1;
  
}
.table-sticky tr:first-child th:first-child{
  z-index: 3;
}
.table-sticky  td:first-child{
  z-index: 1
}
.table-sticky td:first-child, th:first-child{
  position: sticky;
    left: 0;
}
</style>
