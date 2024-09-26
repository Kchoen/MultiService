function toFirstPage() {
    $(document.body).empty();
    $(document.body).append(get_banner());
    $(document.body).append(
        $(`
        <a href="https://tetr.kchoen.com" style="position:absolute;top:30%;left:40%" target="_blank" title="Tetr-2P Battle網站">🔥🔥Tetr-2P Battle網站🔥🔥</a>
        <a href="https://https://kchoen.github.io/StockCal/" style="position:absolute;top:40%;left:40%"target="_blank" title="股票計算機">🔥股票計算機</a>
        <a href="https://https://kchoen.github.io/ReminderApp/" style="position:absolute;top:50%;left:40%"target="_blank" title="飲食記錄APP">🔥飲食記錄APP</a>
        <a href="https://https://kchoen.github.io/DinnerList/" style="position:absolute;top:60%;left:40%"target="_blank" title="餐廳名冊記錄App">🔥餐廳名冊記錄App</a>
        `)
    );
}
