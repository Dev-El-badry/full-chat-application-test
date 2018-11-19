@extends('layouts.app')

@section('styles')

 <link href="{{ asset('css/style.css') }}" rel="stylesheet">

 <script src="https://cdnjs.cloudflare.com/ajax/libs/socket.io/2.1.1/socket.io.js"></script>
@endsection


@section('content')
<div class="container">
    <div class="row">
        <div class="col-md-12">
            <div class="card">
                <div class="card-header">Chat Control</div>

                <div class="card-body">

                <div id="chat-sidebar">
                
                <p><label >Online</label><input type="radio" name="status" value="online" class="status" checked></p>
                <p><label >Offline</label><input type="radio" name="status" value="offline" class="status"></p>
                <p><label >Busy</label><input type="radio" name="status" value="bys" class="status"></p>
                <p><label >DND</label><input type="radio" name="status" value="dnd" class="status"></p>

                @foreach($users as $row)
                    <div id="sidebar-user-box" class="user" uid="{{ $row->id }}">
                        <img src="{{ asset('image/user.png')}}" />
                        <span id="slider-username">{{$row->name}} </span>

                        <span class="user_status badge badge-info user_{{ $row->id }}">&nbsp;</span>
                    </div>
                @endforeach



                </div>
                </div>
            </div>
        </div> 
    </div>
</div>
@endsection

@section('scripts')
    <script src="{{ asset('js/jquery-1.10.1.min.js') }}"></script>
    <script>
        var username = '{{ Auth::user()->name }}';
        var user_id = '{{ Auth::user()->id }}';
    </script>
    <script src="{{ asset('js/script.js') }}"></script>
@endsection
