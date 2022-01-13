<script>
    let jan = [
        {event: "S'mores Night", date: "January 13th"},
        {event: "Ski Lodge", date: "January 16th"}
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
        {event: "Bayou", date: "March 25th - 26th"},
        {event: "Mardi Gras Social w/ GPHI", date: "February 23rd"}
    ];

    let apr = [
        {event: "Fake Wedding", date: "April 9th"},
        {event: "War of The Roses", date: "April 11th - 15th"}
    ];
</script>

<h2>January</h2>
<ul>
    {#each jan as e}
        <li>{e.event} on <span>{e.date}</span></li>
    {/each}
</ul>

<h2>February</h2>
<ul>
	{#each feb as e}
		<li>{e.event} on <span>{e.date}</span></li>
	{/each}
</ul>

<h2>March</h2>
<ul>
	{#each mar as e}
		<li>{e.event} on <span>{e.date}</span></li>
	{/each}
</ul>

<h2>April</h2>
<ul>
	{#each apr as e}
		<li>{e.event} on <span>{e.date}</span></li>
	{/each}
</ul>

<style>
    span {
        font-weight: bold;
    }

    ul {
        list-style-type: none;
        padding: 0px;
        color: #202124;
        font-size: larger;
    }

    @media screen and (max-device-width: 640px) {
        ul {
            list-style-type: none;
            padding: 0px;
            color: #202124;
            font-size: medium;
        }
    }
</style>