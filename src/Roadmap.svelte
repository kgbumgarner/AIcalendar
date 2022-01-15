<script>
    let jan = [
        {event: "S'mores Night", date: "January 13th", dateString: "2022-01-13", class: ""},
        {event: "Ski Lodge", date: "January 16th"},
        {event: "Formal Recruitment", date: "January 18th - 20th"},
        {event: "Informal Recruitment", date: "January 24th - 28th"}
    ];

    let feb = [
        {event: "Chipotle Benefit Night", date: "February 5th"},
        {event: "Formal", date: "February 11th - 13th"},
        {event: "Mom's Weekend", date: "February 18th - 20th"},
        {event: "Mardi Gras Social w/ GPHI", date: "February 23rd"}
    ];

    let mar = [
        {event: "Spring Break", date: "March 5th - 13th"},
        {event: "Social w/ Zeta and SK", date: "March 19th"},
        {event: "Bayou", date: "March 25th - 26th"}
    ];

    let apr = [
        {event: "Fake Wedding", date: "April 9th"},
        {event: "War of The Roses", date: "April 11th - 15th"}
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
        opacity: 0.4;
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