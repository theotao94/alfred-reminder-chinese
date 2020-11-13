/*


*/

var moment = require('moment');
var Parser = require('../parser').Parser;
var ParsedResult = require('../../result').ParsedResult;

var util = require('../../utils/ZH.js');

var PATTERN = new RegExp(
    '(上|今|下|这|呢)?' +
    '(?:个)?' +
    '(?:星期|礼拜)' +
    '(' + Object.keys(util.WEEKDAY_OFFSET).join('|') + ')'
);

var PREFIX_GROUP = 1;
var WEEKDAY_GROUP = 2;

exports.Parser = function ZHWeekdayParser() {

    Parser.apply(this, arguments);

    this.pattern = function() {
        return PATTERN;
    };

    this.extract = function(text, ref, match, opt) {
      var index = match.index;
      text = match[0];
      var result = new ParsedResult({
          index: index,
          text: text,
          ref: ref,
      });

      var dayOfWeek = match[WEEKDAY_GROUP];
      var offset = util.WEEKDAY_OFFSET[dayOfWeek];
      if(offset === undefined) return null;

      var startMoment = moment(ref);
      var prefix = match[PREFIX_GROUP];

      var refOffset = startMoment.day();
      if(prefix == '上') {
          startMoment.day(offset - 7);
      } else if(prefix == '下') {
          startMoment.day(offset + 7);
      } else if(prefix == '今' || prefix == '这' || prefix == '呢') {

          if ( opt.forwardDatesOnly && refOffset > offset ) {
              startMoment.day(offset + 7);
          } else {
              startMoment.day(offset);
          }

      } else {

          if ( opt.forwardDatesOnly && refOffset > offset ) {
              startMoment.day(offset + 7);
          } else if (!opt.forwardDatesOnly && Math.abs(offset - 7 - refOffset) < Math.abs(offset - refOffset)) {
              startMoment.day(offset - 7);
          } else if (!opt.forwardDatesOnly && Math.abs(offset + 7 - refOffset) < Math.abs(offset - refOffset)) {
              startMoment.day(offset + 7);
          } else {
              startMoment.day(offset);
          }
      }

      result.start.assign('weekday', offset);
      result.start.imply('day', startMoment.date());
      result.start.imply('month', startMoment.month() + 1);
      result.start.imply('year', startMoment.year());

      result.tags.ZHWeekdayParser = true;
      return result;
    };
};
