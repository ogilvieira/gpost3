<template>
  <input v-if="hasDatePicker" :value="localValue" :class="className" type="datetime-local" v-on:change="setVal($event.target.value)" v-on:blur="checkInput($event.target.value)" :min="localMin" :max="localMax" :disabled="disabled">
  <input v-else v-model="localValue" :class="className" type="text" v-mask="'##/##/#### ##:##'" placeholder="DD/MM/YYYY HH:MM" v-on:blur="checkInput($event.target.value)" :disabled="disabled">
</template>
<script>
const hasDatePicker = require("../utils").isDateTimeSupported();
const isValidDate = require("../utils").isValidDate;
const moment = require("moment");
moment.locale("pt-br");

module.exports = {
  props: {
    value: {
      default: null
    },
    className: {
      type: String,
      default: ""
    },
    required: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    min: {
      type: String,
      default: ""
    },
    max: {
      type: String,
      default: ""
    }
  },
  data() {
    return {
      hasDatePicker: hasDatePicker,
      isValidDate: isValidDate,
      localValue: null,
      localMax: null,
      localMin: null,
    }
  },
  methods: {
    setVal: function(val) {
      if(!this.hasDatePicker && val) {
        let d = val.split(' ');
          d[0] = d[0].split('/');
          d[0] = d[0][2]+'-'+d[0][1]+'-'+d[0][0];
          d = d.join('T');
          val = d;
      }

      this.$emit('input', this.isValidDate(new Date(val)) ? new Date(val).toISOString() : "");
    },
    checkInput: function(val) {

      if(!this.hasDatePicker && val) {
        let d = val.split(' ');
          d[0] = d[0].split('/');
          d[0] = d[0][2]+'-'+d[0][1]+'-'+d[0][0];
          d = d.join('T');
          val = d;
      }

      if(!this.hasDatePicker && val && val.length < 16) {
        this.localValue = this.parseDate(new Date(this.hasDatePicker ? this.localMin : this.setFormatInText(this.localMin)));
        this.$emit('input', new Date(this.hasDatePicker ? this.localMin : this.setFormatInText(this.localMin)).toISOString());
      }

      if(!val && !this.required) {
        return;
      }

      if(!val && this.required) {
        this.localValue = this.parseDate(new Date(this.hasDatePicker ? this.localMin : this.setFormatInText(this.localMin)));
        this.$emit('input', new Date(this.hasDatePicker ? this.localMin : this.setFormatInText(this.localMin)).toISOString());
        return;
      }

      if( this.localMin && new Date(val).getTime() < new Date(this.hasDatePicker ? this.localMin : this.setFormatInText(this.localMin)).getTime() ) {
        this.localValue = this.parseDate(new Date(this.hasDatePicker ? this.localMin : this.setFormatInText(this.localMin)).toISOString());
        this.$emit('input', new Date(this.hasDatePicker ? this.localMin : this.setFormatInText(this.localMin)).toISOString());
        return;
      }

      if( this.localMax && new Date(val).getTime() > new Date(this.hasDatePicker ? this.localMax : this.setFormatInText(this.localMax)).getTime() ) {
        this.localValue = this.parseDate(new Date(this.hasDatePicker ? this.localMax : this.setFormatInText(this.localMax)).toISOString());
        this.$emit('input', new Date(this.hasDatePicker ? this.localMax : this.setFormatInText(this.localMax)).toISOString());
        return;
      }

    },
    parseDate( val ) {
      if( this.hasDatePicker ) {
        return moment(val).format('YYYY-MM-DDTHH:mm');
      } else {
        return moment(val || new Date()).format("DD-MM-YYYY HH:mm");
      }
    },
    getMinMax( val, type ) {
      if( !val || !isValidDate(new Date(val)) ){
        let d = new Date();
          d.setFullYear(type == 'max' ? (d.getFullYear() + 100) : (d.getFullYear() - 100))
        return d.toISOString();
      } else {
        return new Date(val).toISOString();
      }
    },
    setFormatInText(val) {
    let d = val.split(' ');
      d[0] = d[0].split('/');
      d[0] = d[0][2]+'-'+d[0][1]+'-'+d[0][0];
      d = d.join('T');
      return d;
    }
  },
  created: function() {

    if( this.value && !this.isValidDate(new Date(this.value)) ) {
      this.value = new Date().toISOString();
      this.$emit('input', this.value);
    }

    this.localValue = this.value ? this.parseDate(this.value) : "";
    this.localMax = this.getMinMax(this.max, 'max');
    this.localMin = this.getMinMax(this.min, 'min');
  },
  watch: {
    min: function(newVal, oldVal) {
      this.localMin = this.parseDate(this.getMinMax(this.min, 'min'));
    },
    max: function(newVal, oldVal) {
      this.localMax = this.parseDate(this.getMinMax(this.max, 'max'));
    },
    value: function(newVal, oldVal) {
      if(newVal != oldVal) {
        this.localValue = this.parseDate(newVal);
      }
    }
  }
}
</script>
