<script>
    let jan = [
        {event: "S'mores Night", date: "January 13th", dateString: "2022-01-13", class: ""},
        {event: "Ski Lodge", date: "January 16th", dateString: "2022-01-16", class: ""},
        {event: "Formal Recruitment", date: "January 18th - 20th", dateString: "2022-01-20", class: ""},
        {event: "Informal Recruitment", date: "January 24th - 28th", dateString: "2022-01-28", class: ""}
    ];

    let feb = [
        {event: "Chipotle Benefit Night", date: "February 7th", dateString: "2022-02-07", class: ""},
        {event: "Formal", date: "February 11th - 13th", dateString: "2022-02-13", class: ""},
        {event: "Mom's Weekend", date: "February 18th - 20th", dateString: "2022-02-20", class: ""},
        {event: "Mardi Gras Social w/ GPHI", date: "February 23rd", dateString: "2022-02-23", class: ""}
    ];

    let mar = [
        {event: "Spring Break", date: "March 5th - 13th", dateString: "2022-03-13", class: ""},
        {event: "Social w/ Zeta and SK", date: "March 19th", dateString: "2022-03-19", class: ""},
        {event: "Bayou", date: "March 25th - 26th", dateString: "2022-03-26", class: ""}
    ];

    let apr = [
        {event: "Fake Wedding", date: "April 9th", dateString: "2022-04-09", class: ""},
        {event: "Formal Chapter", date: "April 13th", dateString: "2022-04-13", class: ""},
    ];
    
    let currentDate = new Date();

</script>

<h2>January</h2>
<div class="ulCon">
    <ul>
        {#each jan as e}
            <li class={Date.parse(currentDate) > Date.parse(e.dateString) ? "past" : "upcoming"}>{e.event} on <span>{e.date}</span></li>
        {/each}
    </ul>
</div>
<h2>February</h2>
<div class="ulCon">
    <ul>
        {#each feb as e}
            <li class={Date.parse(currentDate) > Date.parse(e.dateString) ? "past" : "upcoming"}>{e.event} on <span>{e.date}</span></li>
        {/each}
    </ul>
</div>
<h2>March</h2>
<div class="ulCon">
    <ul>
        {#each mar as e}
            <li class={Date.parse(currentDate) > Date.parse(e.dateString) ? "past" : "upcoming"}>{e.event} on <span>{e.date}</span></li>
        {/each}
    </ul>
</div>
<h2>April</h2>
<div class="ulCon">
    <ul>
        {#each apr as e}
            <li class={Date.parse(currentDate) > Date.parse(e.dateString) ? "past" : "upcoming"}>{e.event} on <span>{e.date}</span></li>
        {/each}
    </ul>
</div>
<style>
    span {
        font-weight: bold;
    }

    .ulCon {
        margin-left: auto;
        margin-right: auto;
        width: 400px;
    }

    ul {
        list-style-type: none;
        padding: 0px;
        color: #202124;
        font-size: larger;
    }

    .past {
        opacity: 0.3;
    }

    @media screen and (max-device-width: 640px) {
        ul {
            list-style-type: none;
            padding: 0px;
            color: #202124;
            font-size: medium;
        }

        .ulCon {
            margin-left: auto;
            margin-right: auto;
            width: 340px;
        }
        
    }
</style>