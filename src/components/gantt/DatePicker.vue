<template>
  <div>
    <!-- 添加文本框 -->
    <div class="date-picker-input-wrapper">
      <input type="text" v-model="selectedDateText" @click="showCalendar = true" readonly placeholder="请选择日期"
        class="date-picker-input" ref="inputRef" />
      <span class="clear-date-button" @click="clearDate" v-if="selectedDateText">
        <svg viewBox="0 0 24 24">
          <path
            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z">
          </path>
        </svg>
      </span>
    </div>
    <!-- 日期选择器 -->
    <div class="e-calendar" v-show="showCalendar" ref="calendarRef">
      <div class="e-date-select">
        <div class="e-date-year">
          <transition name="fadeY">
            <div :key="selectDate.year" class="e-date-year-select" @click="openYearList" :class="{ active: showYear }">
              {{ selectDate.year }}
            </div>
          </transition>
        </div>
        <div class="e-date-monthday">
          <transition name="fadeY">
            <div :key="selectDate.day" class="e-date-monthday-select" :class="{ active: !showYear }"
              @click="openCalendarList">
              <span>{{ keepDoubleDigit(selectDate.month) }}-{{ keepDoubleDigit(selectDate.day) }}</span>&nbsp;
              <span style="cursor: pointer;" @click="openMonthList">{{ showDate.monthStr }}</span>
            </div>
          </transition>
        </div>
      </div>

      <div class="e-calendar-container" v-show="!showYear && !showMonth">
        <div class="e-calendar-toolbar">
          <div class="e-calendar-svg" @click="prevMonth">
            <svg viewBox="0 0 24 24" class="e-calendar-svg-icon">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path>
            </svg>
            <transition name="e_calendar_svg_btn">
              <div class="e-calendar-svg-cover" v-if="prevMonthClick"></div>
            </transition>
          </div>
          <div class="e-calendar-toolbar-title">
            <transition :name="fadeXType">
              <div :key="showDate.monthStr" class="e-calendar-toolbar-title-content">
                <strong>{{ showDate.year }}</strong>&nbsp;
                <span style="cursor: pointer;" @click="openMonthList">{{ showDate.monthStr }}</span>
              </div>
            </transition>
          </div>
          <div class="e-calendar-svg" @click="nextMonth">
            <svg viewBox="0 0 24 24" class="e-calendar-svg-icon">
              <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z"></path>
            </svg>
            <transition name="e_calendar_svg_btn">
              <div class="e-calendar-svg-cover" v-if="nextMonthClick"></div>
            </transition>
          </div>
        </div>
        <div class="e-calendar-week">
          <span class="e-calendar-week-day">一</span>
          <span class="e-calendar-week-day">二</span>
          <span class="e-calendar-week-day">三</span>
          <span class="e-calendar-week-day">四</span>
          <span class="e-calendar-week-day">五</span>
          <span class="e-calendar-week-day">六</span>
          <span class="e-calendar-week-day">日</span>
        </div>
        <div class="e-calendar-monthday">
          <transition :name="fadeXType">
            <div :key="showDate.monthStr" class="e-calendar-monthday-wrapper">
              <div v-for="(row, index) in rows" :key="index" class="e-calendar-monthday-row">
                <span v-for="(day, dayIndex) in row" :key="dayIndex" class="e-calendar-monthday-row-day"
                  @click="selectDay(day)" @mouseenter="handleDayMouseEnter(dayIndex, index)"
                  @mouseleave="handleDayMouseLeave()" :class="{
        active: day.selected,
        disabled: day.disabled,
        pointer: day.value !== '',
        hover: isDayHovered(dayIndex, index)
      }">
                  <span v-text="day.value" class="e-calendar-monthday-row-day-value"></span>
                  <transition name="e_calendar_day">
                    <span class="e-calendar-monthday-row-day-cover" v-if="day.selected"></span>
                  </transition>
                </span>
              </div>
            </div>
          </transition>
        </div>
      </div>
      <ul class="e-calendar-year" v-show="showYear" ref="yearList">
        <li v-for="(item, index) in yearList" :key="index" :class="{
        active: item === selectDate.year,
        hover: isYearHovered(index)
      }" @click="selectYear(item)" @mouseenter="handleYearMouseEnter(index)" @mouseleave="handleYearMouseLeave()">
          {{ item }}
        </li>
      </ul>
      <ul class="e-calendar-year" v-show="showMonth" ref="monthList">
        <li v-for="(item, index) in monthList" :key="index" :class="{
        active: item === selectDate.month,
        hover: isMonthHovered(index)
      }" @click="selectMonth(item)" @mouseenter="handleMonthMouseEnter(index)" @mouseleave="handleMonthMouseLeave()">
          {{ item }}
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onBeforeMount, onMounted, onUnmounted, watchEffect } from 'vue';

// 阿拉伯数字 转 汉字数字的基本库
const weekJson = {
  1: '星期一',
  2: '星期二',
  3: '星期三',
  4: '星期四',
  5: '星期五',
  6: '星期六',
  7: '星期日',
};
const monthJson = {
  1: '一月',
  2: '二月',
  3: '三月',
  4: '四月',
  5: '五月',
  6: '六月',
  7: '七月',
  8: '八月',
  9: '九月',
  10: '十月',
  11: '十一月',
  12: '十二月',
};

export default defineComponent({
  props: {
    // 打开date picker的初始值，必传，格式是（2017-08-11）
    date: {
      type: String,
      required: true,
    },
    // 日期最小值
    minDate: String,
    // 日期最大值
    maxDate: String,
  },
  setup(props, { emit }) {
    // 定义响应式数据
    let selectDate = ref({
      year: 0,
      month: 0,
      day: 0,
      week: 0,
      date: '',
      weekStr: '',
      monthStr: '',
    });
    let showDate = ref({
      year: 0,
      month: 0,
      day: 0,
      week: 0,
      date: '',
      monthStr: '',
      weekStr: '',
    });
    let copyMinDate = ref({
      year: 0,
      month: 0,
      day: 0,
    });
    let copyMaxDate = ref({
      year: 0,
      month: 0,
      day: 0,
    });

    const fadeXType = ref('fadeX_Prev');
    const nextMonthClick = ref(false);
    const prevMonthClick = ref(false);
    const showYear = ref(false);
    const showMonth = ref(false);
    const yearListRef = ref<HTMLUListElement | null>(null);
    const monthListRef = ref<HTMLUListElement | null>(null);
    const showCalendar = ref(false); // 控制日期选择器的显示和隐藏
    const selectedDateText = ref(''); // 文本框显示的日期
    const calendarRef = ref<HTMLDivElement | null>(null); // 日期组件的引用
    const inputRef = ref<HTMLInputElement | null>(null); // 新增文本框引用

    const hoveredYearIndex = ref(-1);
    const hoveredMonthIndex = ref(-1);
    const hoveredDayIndex = ref({ row: -1, col: -1 });

    const yearList = computed(() => {
      const result: number[] = [];
      for (let i = copyMinDate.value.year; i <= copyMaxDate.value.year; i += 1) {
        result.push(i);
      }
      return result;
    });

    const monthList = computed(() => {
      const result: number[] = [];
      for (let i = 1; i <= 12; i += 1) {
        result.push(i);
      }
      return result;
    });

    const rows = computed(() => {
      const { year, month } = showDate.value;
      const months = new Date(year, month, 0).getDate();
      const result: {
        value: number | string;
        selected?: boolean;
        disabled?: boolean;
      }[][] = [];
      let row: {
        value: number | string;
        selected?: boolean;
        disabled?: boolean;
      }[] = [];
      let weekValue: number;
      // 按照星期分组
      for (let i = 1; i <= months; i += 1) {
        // 根据日期获取星期，并让开头是1，而非0
        weekValue = new Date(year, month - 1, i).getDay() + 1;
        // 判断月第一天在星期几，并填充前面的空白区域
        if (i === 1 && weekValue !== 1) {
          addRowEmptyValue(row, weekValue);
          addRowDayValue(row, i);
        } else {
          addRowDayValue(row, i);
          // 判断月最后一天在星期几，并填充后面的空白区域
          if (i === months && weekValue !== 7) {
            addRowEmptyValue(row, (7 - weekValue) + 1);
          }
        }
        // 按照一周分组
        if (weekValue % 7 === 0 || i === months) {
          result.push(row);
          row = [];
        }
      }
      showDate.value.monthStr = monthJson[showDate.value.month as keyof typeof monthJson];
      return result;
    });

    // 定义函数，接收一个 number 类型的参数，返回一个 string 类型的值
    const keepDoubleDigit = (number: number): string => {
      // 判断传入的数字是否大于 9
      return number > 9 ? String(number) : `0${number}`;
    };

    // 拆分日期
    const splitDate = (date: string, addStr = false) => {
      let result: {
        year: number;
        month: number;
        day: number;
        week?: number;
        monthStr?: string;
        weekStr?: string;
      } = {
        year: 0,
        month: 0,
        day: 0,
      };
      const splitValue = date.split('-');
      try {
        if (!splitValue || splitValue.length < 3) {
          throw new Error('时间格式不正确');
        }
        result = {
          year: Number(splitValue[0]),
          month: Number(splitValue[1]),
          day: Number(splitValue[2]),
        };
        if (addStr) {
          result.week = new Date(result.year, result.month - 1, result.day).getDay() + 1;
          result.monthStr = monthJson[result.month as keyof typeof monthJson];
          result.weekStr = weekJson[result.week as 1 | 2 | 3 | 4 | 5 | 6 | 7];
        }
      } catch (error) {
        console.error(error);
      }
      return result;
    };

    // 初始化日期选择器
    const initDatePicker = () => {
      const splitResult = splitDate(props.date, true);
      showDate.value = {
        ...splitResult,
        date: `${splitResult.year}-${keepDoubleDigit(splitResult.month)}-${keepDoubleDigit(
          splitResult.day
        )}`,
        week: splitResult.week || 0,
        monthStr: splitResult.monthStr || '',
        weekStr: splitResult.weekStr || '',
      };
      copyMinDate.value = { ...splitDate(props.minDate || '1970-01-01') };
      copyMaxDate.value = { ...splitDate(props.maxDate || '2099-12-31') };
      selectDate.value = { ...showDate.value };
      selectedDateText.value = showDate.value.date;
    };

    watchEffect(() => {
      if (props.date) {
        initDatePicker(); // 当 props.date 变化时重新初始化日期选择器
      }
    });

    onBeforeMount(() => {
      initDatePicker();
    });

    // 添加空值
    const addRowEmptyValue = (
      row: {
        value: number | string;
        selected?: boolean;
        disabled?: boolean;
      }[],
      count: number
    ) => {
      for (let w = 1; w < count; w += 1) {
        row.push({
          value: '',
        });
      }
    };

    // 添加日期值
    const addRowDayValue = (
      row: {
        value: number | string;
        selected?: boolean;
        disabled?: boolean;
      }[],
      i: number
    ) => {
      const value = { value: i };
      const { day, month, year } = selectDate.value;
      const showDateValue = showDate.value;
      // 判断已经选择的
      if (year === showDateValue.year && month === showDateValue.month && day === i) {
        // 为对象添加 selected 属性
        const newValue = { ...value, selected: true };
        row.push(newValue);
        return; // 添加 return 避免重复添加
      }
      // 当日期在最小值之外，禁止点击
      if (isMinLimitMonth() && i < copyMinDate.value.day) {
        // 修复：添加 disabled 属性
        const newValue = { ...value, disabled: true };
        row.push(newValue);
        return; // 添加 return 避免重复添加
      }
      // 当日期在最大值之外，禁止点击
      if (isMaxLimitMonth() && i > copyMaxDate.value.day) {
        // 修复：添加 disabled 属性
        const newValue = { ...value, disabled: true };
        row.push(newValue);
        return; // 添加 return 避免重复添加
      }
      row.push(value);
    };

    // 切换到上一个月
    const prevMonth = () => {
      if (prevMonthClick.value) {
        return;
      }
      prevMonthClick.value = true;
      setTimeout(() => {
        prevMonthClick.value = false;
      }, 500);
      fadeXType.value = 'fadeX_Prev';
      // 如何当前月份已经小于等于minMonth 就不让其在执行
      if (isMinLimitMonth()) {
        return;
      }
      const { year, month } = showDate.value;
      // 判断当前月份，如果已经等于1（1就是一月，而不是二月）
      if (month <= 1) {
        showDate.value.year = year - 1;
        showDate.value.month = 12;
      } else {
        showDate.value.month -= 1;
      }
    };

    // 切换到下一个月
    const nextMonth = () => {
      if (nextMonthClick.value) {
        return;
      }
      nextMonthClick.value = true;
      setTimeout(() => {
        nextMonthClick.value = false;
      }, 500);
      fadeXType.value = 'fadeX_Next';
      // 如何当前月份已经大于等于maxMonth 就不让其在执行
      if (isMaxLimitMonth()) {
        return;
      }
      const { year, month } = showDate.value;
      // 判断当前月份，如果已经等于12（12就是十二月）
      if (month >= 12) {
        showDate.value.year = year + 1;
        showDate.value.month = 1;
      } else {
        showDate.value.month += 1;
      }
    };

    // 重置选择日期
    let resetSelectDate = (dayValue: number) => {
      // 修改为逐个修改属性
      selectDate.value.year = showDate.value.year;
      selectDate.value.month = showDate.value.month;
      selectDate.value.week = showDate.value.week;
      selectDate.value.date = showDate.value.date;
      selectDate.value.weekStr = showDate.value.weekStr;
      selectDate.value.monthStr = showDate.value.monthStr;
      selectDate.value.day = dayValue;
      selectDate.value.week = new Date(showDate.value.year, showDate.value.month - 1, dayValue).getDay() + 1;
      selectDate.value.weekStr = weekJson[selectDate.value.week as keyof typeof weekJson];
      selectedDateText.value = `${selectDate.value.year}-${keepDoubleDigit(
        selectDate.value.month
      )}-${keepDoubleDigit(selectDate.value.day)}`;
      showCalendar.value = false; // 选择日期后隐藏日期选择器
    };

    // 选择日期
    const selectDay = (days: { value: number | string; disabled?: boolean }) => {
      if (days.disabled || days.value === '') {
        return;
      }
      resetSelectDate(Number(days.value));
      const { year, month, day, week, weekStr, monthStr } = selectDate.value;
      emit('confirm', {
        date: `${year}-${keepDoubleDigit(month)}-${keepDoubleDigit(day)}`,
        year,
        month,
        week,
        monthStr,
        weekStr,
        day,
      });
    };

    // 选择月份
    const selectMonth = (value: number) => {
      showYear.value = false;
      showMonth.value = false;
      showDate.value.month = value;
      let type: 'copyMinDate' | 'copyMaxDate' | undefined;
      // 当月份在最小值之外，日期换成最小值日期 或者 当月份在最大值之外，日期换成最大值日期
      if (isMinLimitMonth()) {
        type = 'copyMinDate';
      } else if (isMaxLimitMonth()) {
        type = 'copyMaxDate';
      }
      if (type) {
        showDate.value.day = type === 'copyMinDate' ? copyMinDate.value.day : copyMaxDate.value.day;
        resetSelectDate(showDate.value.day);
        return;
      }
      let dayValue = selectDate.value.day;
      // 判断日是最大值，防止另一个月没有这个日期
      const daysInMonth = new Date(showDate.value.year, showDate.value.month + 1, 0).getDate();
      dayValue = Math.min(dayValue, daysInMonth); // 确保日期不超过当前月份的最大天数
      resetSelectDate(dayValue);
    };

    // 选择年份
    const selectYear = (value: number) => {
      showYear.value = false;
      showMonth.value = false;
      showDate.value.year = value;
      let type: 'copyMinDate' | 'copyMaxDate' | undefined;
      // 当日期在最小值之外，月份换成最小值月份 或者 当日期在最大值之外，月份换成最大值月份
      if (isMinLimitMonth()) {
        type = 'copyMinDate';
      } else if (isMaxLimitMonth()) {
        type = 'copyMaxDate';
      }
      if (type) {
        showDate.value.month = type === 'copyMinDate' ? copyMinDate.value.month : copyMaxDate.value.month;
        showDate.value.day = type === 'copyMinDate' ? copyMinDate.value.day : copyMaxDate.value.day;
        resetSelectDate(showDate.value.day);
        return;
      }
      let dayValue = selectDate.value.day;
      // 判断日是最大值，防止另一个月没有这个日期
      const months = new Date(showDate.value.year, showDate.value.month, 0).getDate();
      dayValue = Math.min(dayValue, months); // 确保日期不超过当前月份的最大天数
      resetSelectDate(dayValue);
    };

    // 判断是否为最小月份限制
    const isMinLimitMonth = () => {
      return showDate.value.year <= copyMinDate.value.year && showDate.value.month <= copyMinDate.value.month;
    };

    // 判断是否为最大月份限制
    const isMaxLimitMonth = () => {
      return showDate.value.year >= copyMaxDate.value.year && showDate.value.month >= copyMaxDate.value.month;
    };

    // 打开年份列表
    const openYearList = () => {
      if (showYear.value) {
        showYear.value = false;
        showMonth.value = false;
        return;
      }
      const index = yearList.value.indexOf(selectDate.value.year);
      showYear.value = true;
      showMonth.value = false;
      setTimeout(() => {
        if (yearListRef.value) {
          yearListRef.value.scrollTop = (index - 3) * 40;
        }
      });
    };

    // 打开月份列表
    const openMonthList = () => {
      if (showMonth.value) {
        showYear.value = false;
        showMonth.value = false;
        return;
      }
      const index = monthList.value.indexOf(selectDate.value.month);
      showMonth.value = true;
      showYear.value = false;
      setTimeout(() => {
        if (monthListRef.value) {
          monthListRef.value.scrollTop = (index - 3) * 20;
        }
      });
    };

    const openCalendarList = () => {
      showYear.value = false;
    };

    // 清除日期的方法
    const clearDate = () => {
      selectedDateText.value = '';
      showCalendar.value = false;
    };

    // 点击文本框和日期组件以外的区域，隐藏日期组件
    const handleClickOutside = (event: MouseEvent) => {
      if (
        calendarRef.value &&
        inputRef.value &&
        !calendarRef.value.contains(event.target as Node) &&
        !inputRef.value.contains(event.target as Node)
      ) {
        showCalendar.value = false;
      }
    };

    const isYearHovered = (index: number) => hoveredYearIndex.value === index;
    const isMonthHovered = (index: number) => hoveredMonthIndex.value === index;
    const isDayHovered = (col: number, row: number) =>
      hoveredDayIndex.value.row === row && hoveredDayIndex.value.col === col;

    const handleYearMouseEnter = (index: number) => {
      hoveredYearIndex.value = index;
    };

    const handleYearMouseLeave = () => {
      hoveredYearIndex.value = -1;
    };

    const handleMonthMouseEnter = (index: number) => {
      hoveredMonthIndex.value = index;
    };

    const handleMonthMouseLeave = () => {
      hoveredMonthIndex.value = -1;
    };

    const handleDayMouseEnter = (col: number, row: number) => {
      hoveredDayIndex.value = { row, col };
    };

    const handleDayMouseLeave = () => {
      hoveredDayIndex.value = { row: -1, col: -1 };
    };

    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
    });

    onUnmounted(() => {
      document.removeEventListener('click', handleClickOutside);
    });

    return {
      selectDate,
      showDate,
      copyMinDate,
      copyMaxDate,
      fadeXType,
      nextMonthClick,
      prevMonthClick,
      keepDoubleDigit,
      showYear,
      yearList,
      rows,
      yearListRef,
      prevMonth,
      nextMonth,
      selectDay,
      selectYear,
      openYearList,
      openMonthList,
      monthList,
      monthListRef,
      showMonth,
      selectMonth,
      openCalendarList,
      showCalendar,
      selectedDateText,
      clearDate,
      calendarRef,
      inputRef,
      isYearHovered,
      isMonthHovered,
      isDayHovered,
      handleYearMouseEnter,
      handleYearMouseLeave,
      handleMonthMouseEnter,
      handleMonthMouseLeave,
      handleDayMouseEnter,
      handleDayMouseLeave
    };
  },
});
</script>

<style lang="scss" scoped>
.e-calendar {
  background-color: #ffffff;
  width: 310px;
  border: 1px solid #ccc;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  // 添加较高的 z-index 值
  z-index: 999;
  // 如果需要绝对定位，确保父元素有相对定位
  position: absolute;
}

.e-date-select {
  background-color: #00bcd4;
  padding: 12px 20px;
  color: #ffffff;
  font-weight: 500;
}

.date-picker-input-wrapper {
  position: relative;
  display: inline-block;
}

.date-picker-input {
  width: 200px;
  padding: 10px 15px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: border-color 0.3s ease;
}

.date-picker-input:focus {
  outline: none;
  border-color: #00bcd4;
  box-shadow: 0 0 5px rgba(0, 188, 212, 0.5);
}

.clear-date-button {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  cursor: pointer;
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-date-button svg {
  fill: #999;
  width: 16px;
  height: 16px;
}

.clear-date-button:hover svg {
  fill: #333;
}

.e-date-year {
  font-size: 18px;
  padding-bottom: 4px;
  position: relative;
  width: 66px;
  height: 25px;
  overflow: hidden;
  cursor: pointer;
}

.e-date-year-select {
  position: absolute;
  opacity: 0.7;
  font-size: 20px;
}

.e-date-year-select.active {
  opacity: 1;
}

.e-date-monthday {
  font-size: 26px;
  position: relative;
  width: 100%;
  height: 36px;
  overflow: hidden;
}

.e-date-monthday-select {
  position: absolute;
  opacity: 0.7;
}

.e-date-monthday-select.active {
  opacity: 1;
}

.e-calendar-toolbar {
  margin: 5px 10px 5px 10px;
  height: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.e-calendar-toolbar-title {
  position: relative;
  width: 100px;
  height: 22px;
  text-align: center;
}

.e-calendar-toolbar-title-content {
  position: absolute;
  width: 100%;
  font-size: 16px;
}

.e-calendar-svg {
  padding: 8px;
  position: relative;
  height: 40px;
  width: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.e-calendar-svg-icon {
  display: block;
  fill: currentColor;
  height: 24px;
  width: 24px;
  user-select: none;
  position: relative;
  z-index: 2;
}

.e-calendar-svg-cover {
  position: absolute;
  left: 0;
  top: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
  background-color: #e0e0e0;
  border-radius: 50%;
  opacity: 0;
  display: inline-block;
}

.e-calendar-week {
  width: 100%;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.87);
  opacity: 0.5;
  display: flex;
  justify-content: center;
  align-items: center;
  height: 16px;
}

.e-calendar-week-day {
  flex: 1;
  text-align: center;
}

.e-calendar-monthday {
  padding-top: 10px;
  font-size: 14px;
  position: relative;
  width: 100%;
  min-height: 220px;
  overflow: hidden;
}

.e-calendar-monthday-wrapper {
  position: absolute;
  width: 100%;
  height: 100%;
}

.e-calendar-monthday-row {
  display: flex;
  justify-content: center;
  align-items: center;
}

.e-calendar-monthday-row-day {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  position: relative;
  height: 35px;
}

.e-calendar-monthday-row-day.pointer {
  cursor: pointer;
}

.e-calendar-monthday-row-day.active {
  color: #ffffff;
}

.e-calendar-monthday-row-day.disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.e-calendar-monthday-row-day-value {
  position: relative;
  z-index: 1;
}

.e-calendar-monthday-row-day-cover {
  width: 25px;
  height: 25px;
  background-color: #00bcd4;
  position: absolute;
  left: 10px;
  top: 5px;
  transform: translate3d(0, 0, 0);
  z-index: 0;
  border-radius: 50%;
  opacity: 1;
  display: block;
}

.e-calendar-monthday-row-day.hover {
  background-color: #e0e0e0;
  /* 鼠标悬停时的背景颜色，可按需调整 */
}

.e-calendar-year {
  height: 276px;
  overflow: auto;
}

.e-calendar-year li {
  padding: 10px;
  text-align: center;
  font-size: 16px;
  cursor: pointer;
}

.e-calendar-year li.active {
  color: #00bcd4;
  font-size: 20px;
  font-weight: bold;
}

.e-calendar-year li.hover {
  background-color: #e0e0e0;
  /* 这里设置鼠标悬停时的背景颜色，可按需调整 */
}

.fadeX_Prev-enter-active,
.fadeX_Prev-leave-active,
.fadeX_Next-enter-active,
.fadeX_Next-leave-active,
.fadeY-enter-active,
.fadeY-leave-active {
  transition: all 0.5s;
}

.fadeX_Prev-enter {
  transform: translateX(-100px);
  opacity: 0;
}

.fadeX_Prev-leave-active {
  transform: translateX(100px);
  opacity: 0;
}

.fadeX_Next-enter {
  transform: translateX(100px);
  opacity: 0;
}

.fadeX_Next-leave-active {
  transform: translateX(-100px);
  opacity: 0;
}

.fadeY-enter {
  transform: translateY(30px);
  opacity: 0;
}

.fadeY-leave-active {
  transform: translateY(-30px);
  opacity: 0;
}

.e_calendar_svg_btn-enter-active,
.e_calendar_svg_btn-leave-active {
  transition: all 1s;
}

.e_calendar_svg_btn-enter {
  opacity: 1;
}

.e_calendar_day-enter-active {
  transition: all 0.2s;
}

.e_calendar_svg_btn-leave-active,
.e_calendar_day-enter {
  opacity: 0;
}

.e_calendar_day-enter {
  width: 0;
  height: 0;
  transform: translate3d(12px, 12px, 0);
}
</style>